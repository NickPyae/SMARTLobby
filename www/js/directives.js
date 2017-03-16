angular.module('SMARTLobby.directives', [])
  .directive('visitorComponent', function () {
    return {
      templateUrl: 'templates/visitor-component.html'
    };
  })
  .directive('errSrc', function() {
    return {
      link: function(scope, element, attrs) {
        element.bind('error', function() {
          if (attrs.src != attrs.errSrc) {
            attrs.$set('src', attrs.errSrc);
          }
        });
      }
    }
  })
.directive('visitorDividerComponent', function () {
    return {
      templateUrl: 'templates/visitor-divider-component.html'
    };
  })
  .directive('clickToRevealOptionComponent', function () {
    return {
      restrict: 'A',
      link: function (scope, element, attrs) {

        scope.$on('visitorStatusHasUpdated', function (event, args) {
          revealOptionComponent();
        });

        element.bind('click', function (e) {
          e.stopPropagation();

          revealOptionComponent();
        });

        function revealOptionComponent() {
          angular.forEach(element.parent().parent().parent()[0].children, function (item) {

            // Grab individual content
            var content = item.querySelector('.item-content');

            // Grab the buttons and their width
            var buttons = item.querySelector('.item-options-left')

            if (!buttons) {
              return;
            }

            var buttonsWidth = buttons.offsetWidth;

            ionic.requestAnimationFrame(function () {
              content.style[ionic.CSS.TRANSITION] = 'all ease-out .25s';

              if (!buttons.classList.contains('invisible')) {
                content.style[ionic.CSS.TRANSFORM] = '';
                setTimeout(function () {
                  buttons.classList.add('invisible');
                }, 250);
              } else {
                buttons.classList.remove('invisible');
                content.style[ionic.CSS.TRANSFORM] = 'translate3d(+' + buttonsWidth + 'px, 0, 0)';
              }
            });
          });
        }
      }
    };
  })
  .directive('pieChartComponent', function (APP_CONFIG, ContactStatusService, $state) {
    return {
      link: function (scope, element, attrs) {

        var pieChartConfig = {
          type: 'pie',
          data: {
            labels: [],
            datasets: [{
              data: [],
              backgroundColor: [
                '#454242', //Gray
                '#FF0000', //Red
                '#FFC200', //Amber
                '#008000' //Green
              ],
              hoverBackgroundColor: [
                '#736F6E', //Light Gray
                '#f65656', //Light Red
                '#ffda66', //Light Amber
                '#4ca64c' //Light Green
              ]
            }]
          },
          options: {
            responsive: false, // Setting true will break pie chart on iOS UIWebView
            tooltips: {
              enabled: true,
            },
            legend: {
              position: 'top',
              onClick: function (event, legendItem) {
              },
              labels: {
                fontSize: 9
              }
            },
            showNumberOnSlice: true
          }
        };

        scope.$on('updatePieChart', function (event, args) {
          // Clearing data before adding new labels
          pieChartConfig.data.labels = [];

          // Clearing all the data before adding new data again
          angular.forEach(pieChartConfig.data.datasets, function (sets) {
            sets.data = [];
          });

          var unCountactedCount = 0;
          var noReplyCount = 0;
          var inBuildingCount = 0;
          var leftBuildingCount = 0;
          var vacatingCount = 0;
          var evacuatedCount = 0;

          var allVisitors = ContactStatusService.getVisitors();

          angular.forEach(allVisitors, function (visitor) {
            if (visitor.contactStatus === APP_CONFIG.CONTACT_STATUS.UNCONTACTED) {
              unCountactedCount++;
            } else if (visitor.contactStatus === APP_CONFIG.CONTACT_STATUS.NO_REPLY) {
              noReplyCount++;
            } else if (visitor.contactStatus === APP_CONFIG.CONTACT_STATUS.IN_BUILDING) {
              inBuildingCount++;
            } else if (visitor.contactStatus === APP_CONFIG.CONTACT_STATUS.LEFT_BUILDING) {
              leftBuildingCount++;
            } else if (visitor.contactStatus === APP_CONFIG.CONTACT_STATUS.VACATING) {
              vacatingCount++;
            } else if (visitor.contactStatus === APP_CONFIG.CONTACT_STATUS.EVACUATED) {
              evacuatedCount++;
            }
          });

          pieChartConfig.data.labels.push(APP_CONFIG.CONTACT_STATUS.UNCONTACTED);
          pieChartConfig.data.datasets[0].data.push(unCountactedCount);
          pieChartConfig.data.labels.push(APP_CONFIG.CONTACT_STATUS.NO_REPLY);
          pieChartConfig.data.datasets[0].data.push(noReplyCount);

          if (args === APP_CONFIG.MODE.DEFAULT) {
            pieChartConfig.data.labels.push(APP_CONFIG.CONTACT_STATUS.IN_BUILDING);
            pieChartConfig.data.datasets[0].data.push(inBuildingCount);
            pieChartConfig.data.labels.push(APP_CONFIG.CONTACT_STATUS.LEFT_BUILDING);
            pieChartConfig.data.datasets[0].data.push(leftBuildingCount);
          } else {
            pieChartConfig.data.labels.push(APP_CONFIG.CONTACT_STATUS.VACATING);
            pieChartConfig.data.datasets[0].data.push(vacatingCount);
            pieChartConfig.data.labels.push(APP_CONFIG.CONTACT_STATUS.EVACUATED);
            pieChartConfig.data.datasets[0].data.push(evacuatedCount);
          }

          var pieChartCanvas = document.getElementById('pieChart').getContext('2d');
          pieChartCanvas.canvas.width = 350; // Due to responsive false, absolute width is provided in order to resize
          pieChartCanvas.canvas.height = 350; // Due to responsive false, absolute height is provided in order to resize
          var pieChart = new Chart(pieChartCanvas, pieChartConfig);

          Chart.pluginService.register({
            afterDraw: function (chart, easing) {
              if (chart.config.options.showNumberOnSlice || chart.config.options.showLabel) {
                var self = chart.config;
                var ctx = chart.chart.ctx;

                ctx.font = '30px Arial Bold';
                ctx.textAlign = 'center';
                ctx.fillStyle = '#fff';

                self.data.datasets.forEach(function (dataset, datasetIndex) {
                  var total = 0, //total values to compute fraction
                    labelxy = [],
                    offset = Math.PI / 2, //start sector from top
                    radius,
                    centerx,
                    centery,
                    lastend = 0; //prev arc's end line: starting with 0

                  //for (var val of dataset.data) { total += val; }

                  for (val = 0; val < dataset.data.length; val++) {
                    total += dataset.data[val];
                  }

                  //TODO needs improvement
                  var i = 0;
                  var meta = dataset._meta[i];
                  while (!meta) {
                    i++;
                    meta = dataset._meta[i];
                  }

                  var element;
                  for (index = 0; index < meta.data.length; index++) {

                    element = meta.data[index];
                    radius = 0.9 * element._view.outerRadius - element._view.innerRadius;
                    centerx = element._model.x;
                    centery = element._model.y;
                    var thispart = dataset.data[index],
                      arcsector = Math.PI * (2 * thispart / total);
                    if (element.hasValue() && dataset.data[index] > 0) {
                      labelxy.push(lastend + arcsector / 2 + Math.PI + offset);
                    }
                    else {
                      labelxy.push(-1);
                    }
                    lastend += arcsector;
                  }


                  var lradius = radius * 3 / 4;
                  for (var idx in labelxy) {
                    if (labelxy[idx] === -1) continue;
                    var langle = labelxy[idx],
                      dx = centerx + lradius * Math.cos(langle),
                      dy = centery + lradius * Math.sin(langle),
                      val = Math.round(dataset.data[idx] / total * 100);
                    if (chart.config.options.showNumberOnSlice)
                      ctx.fillText(dataset.data[idx], dx, dy);
                    else
                      ctx.fillText(chart.config.data.labels[idx], dx, dy);
                  }
                  ctx.restore();
                });
              }
            }
          });

          document.getElementById('pieChart').onclick = function (evt) {
            var activePoints = pieChart.getElementsAtEvent(evt);

            if (activePoints.length > 0) {
              //get the internal index of slice in pie chart
              var clickedElementindex = activePoints[0]['_index'];

              //get specific label by index
              var label = pieChart.data.labels[clickedElementindex];

              ContactStatusService.setContactStatus(label);

              $state.go('tab.visitors');
            }
          }
        });

      }
    };
  })
  .directive('comboChartComponent', function () {
    return {
      link: function (scope, element, attrs) {

        var comboChartData = {
          labels: [],
          datasets: [{
            type: 'bar',
            label: 'In-building',
            backgroundColor: '#396191',
            data: [],
            borderColor: '#396191',
            pointBorderWidth: 2,
            pointBorderColor: '#396191',
            pointBackgroundColor: '#396191',
            fill: false
          }, {
            type: 'line',
            label: 'Checked-in',
            backgroundColor: '#604C7B',
            data: [],
            borderColor: '#604C7B',
            pointBorderWidth: 5,
            pointBorderColor: '#604C7B',
            pointBackgroundColor: '#604C7B',
            pointHoverRadius: 5,
            pointRadius: 1,
            pointHitRadius: 10,
            pointHoverBorderWidth: 5,
            lineTension: 0,
            fill: false
          },
            {
              type: 'bar',
              label: 'Checked-out',
              backgroundColor: '#CBC7CC',
              data: [],
              borderColor: '#CBC7CC',
              pointBorderWidth: 2,
              pointBorderColor: '#CBC7CC',
              pointBackgroundColor: '#CBC7CC',
              fill: false
            }]
        };

        scope.$on('updateComboChart', function (event, args) {
          // Clearing all the data before adding new data again
          comboChartData.labels = [];

          // Clearing all the data before adding new data again
          angular.forEach(comboChartData.datasets, function (sets) {
            sets.data = [];
          });

          angular.forEach(args.siteDetails, function (site) {

            // Labels
            comboChartData.labels.push(site.key);
            // In Building
            comboChartData.datasets[0].data.push(site.inBuildingVisitor);

            // Checked-in
            comboChartData.datasets[1].data.push(site.checkin);

            // Checked-out
            comboChartData.datasets[2].data.push(site.checkout);

            var comboChartCanvas = document.getElementById('comboChart').getContext('2d');
            var comboChart = new Chart(comboChartCanvas, {
              type: 'bar',
              data: comboChartData,
              options: {
                responsive: true,
                hoverMode: 'label',
                hoverAnimationDuration: 400,
                legend: {
                  position: 'top',
                  labels: {
                    fontSize: 9
                  }
                },
                tooltips: {
                  mode: 'label'
                },
                scales: {
                  xAxes: [{
                    display: true,
                    scaleLabel: {
                      display: true,
                      labelString: 'Time at Site ' + '(' + new Date().toLocaleString() + ')'
                    }
                  }],
                  yAxes: [{
                    display: true,
                    scaleLabel: {
                      display: true,
                      labelString: 'Number of Visitors'
                    }
                  }]
                },
                title: {
                  display: true,
                  text: 'Daily Visitor Checkin/out Momentum'
                }
              }
            });
          });
        });
      }
    };

  })

