import { Test } from './models/test';
import { Component, OnInit } from '@angular/core';
import { SpeedtestService } from './speedtest.service';
import * as d3 from 'd3';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})

export class AppComponent implements OnInit {
  readonly ping = 0;
  readonly download = 1;
  readonly upload = 2;

  private speedTests;
  chartData: any[] = [
    {'name': 'Ping', 'series': []},
    {'name': 'Download', 'series': []},
    {'name': 'Upload', 'series': []}
  ];

  view: any[];

  // options
  showXAxis = true;
  showYAxis = true;
  gradient = true;
  showLegend = true;
  showXAxisLabel = true;
  xAxisLabel = 'Time';
  showYAxisLabel = true;
  yAxisLabel = 'speed';
  curve = d3.curveCatmullRom.alpha(.5);
  timeline = true;

  colorScheme = {
    domain: [
      '#647c8a', '#2196f3', '#afdf0a', '#f3e562', '#ff5722'
    ]
  };

  // line, area
  autoScale = true;
  yScaleMax = 50;
  serverName = 'Cape Town';
  serverSponsor: Test = null;

  constructor(private speedTestService: SpeedtestService) {}

  ngOnInit(): void {
    this.speedTestService.getSpeedtests().then(data => {
      this.speedTests = data;
      this.test();
    });
  }

  filteredData(): Test[] {
    return this.speedTests.filter((test: Test) => {
      if (this.serverSponsor) {
        return test.server_id === this.serverSponsor.server_id;
      } else {
        if (this.serverName === 'CT') {
          return test.server_name === 'Cape Town';
        }
        return test.server_name === this.serverName && test.server_id !== 9682;
      }
    });
  }

  test() {
    for (const test of this.filteredData()) {
      const date = new Date(test.api_timestamp.replace('SAST ', ''));
      const ping = {'value': test.ping, 'name': date};
      const download = {'value': test.download, 'name': date};
      const upload = {'value': test.upload, 'name': date};

      this.chartData[this.ping].series.push(ping);
      this.chartData[this.download].series.push(download);
      this.chartData[this.upload].series.push(upload);
    }
    this.chartData = [...this.chartData];
  }

  select(server) {
    this.serverSponsor = null;
    this.serverName = server;
    this.chartData = [
      {'name': 'Ping', 'series': []},
      {'name': 'Download', 'series': []},
      {'name': 'Upload', 'series': []}
    ];
    this.test();
  }

  selectSponsor(test: Test) {
    this.serverSponsor = test;
    this.chartData = [
      {'name': 'Ping', 'series': []},
      {'name': 'Download', 'series': []},
      {'name': 'Upload', 'series': []}
    ];
    this.test();
  }

  serverList() {
    if (!this.speedTests) {
      return;
    }
    const included = [];
    const list: Test[] = [];
    this.speedTests.forEach((test: Test) => {
      if (!included.includes(test.sponsor)) {
        list.push(test);
        included.push(test.sponsor);
      }
    });
    return list;
  }

  getName(test: Test): string {
    return test.server_name + ': ' + test.sponsor;
  }
  log(e) {
    console.log(e);
  }
}

