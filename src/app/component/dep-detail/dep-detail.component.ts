import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/service/Auth/auth.service';
import { Departement, DepartementService } from 'src/app/service/depart/departement.service';
import { IndicatorService } from 'src/app/service/indicator-Evaluation/indicator.service';

@Component({
  standalone: false,
  selector: 'app-dep-detail',
  templateUrl: './dep-detail.component.html',
  styleUrls: ['./dep-detail.component.css']
})
export class DepDetailComponent implements OnInit, OnDestroy {


  private sub1 !: Subscription;


  deleteDep(arg0: Departement) {
    this.sub1 = this.depsevice.delDep(arg0).subscribe(_=>
      this.router.navigate(['departement'])

      );
  }


  department !: Departement;
  evaluation: Map<string, number> = new Map<string, number>();
  redundant: string[] = [];
  constructor(private route: ActivatedRoute, private depsevice: DepartementService, public authservice: AuthService, private router: Router, private indicatorService: IndicatorService) { }
  ngOnDestroy(): void {
    this.sub1?.unsubscribe();
  }
  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.depsevice.getDeps().subscribe(a => {
        this.department = a.filter(a => a.id === parseInt(idParam))[0]
        this.department.indicators?.forEach(i => {

          this.indicatorService.getEvalaution(i.id).subscribe(e => {
            this.evaluation.set(i.name, e.value);
            this.redundant.push(i.name);
            if ((e.value < i?.acceptableValue && i.performance === "asc") || (e.value > i?.acceptableValue && i.performance === "desc")) {
              this.nbad++;
            } else {
              this.ngood++;
            }
          })
        });

      });
    }
  }
  ngood: number = this.getgood()
  getgood() {
    return 0
  };
  nbad: number = 0;

  getColor(a: string, v: number) {
    this.chartOptions = {
      xAxis: {
        type: 'category',
        data: [this.department.name], // Replace with your actual names
      },
      yAxis: {
        type: 'value',
      },

      series: [
        {
          name: 'Indicators',
          data: [this.department.indicators?.length], // Replace with your actual data values for Bar 1
          type: 'bar',
          itemStyle: {
            color: '#337ab7', // Replace with your desired color for Bar 1
          },
        },

        {
          name: 'Acceptable',
          data: [this.ngood], // Replace with your actual data values for Bar 2
          type: 'bar',
          itemStyle: {
            color: '#008000c7', // Replace with your desired color for Bar 2
          },
        },
        {
          name: 'Bad',
          data: [this.nbad], // Replace with your actual data values for Bar 3
          type: 'bar',
          itemStyle: {
            color: '#e84949ab', // Replace with your desired color for Bar 3
          },
        },
      ],
      label: {
        show: true,
        formatter: function (params: any) {
          return params.seriesName + ': ' + params.value;
        },
      },

    };

    var i = this.department.indicators?.filter(i => i.name === a)[0];
    if ((i && v < i?.acceptableValue && i.performance === "asc") || (i && v > i?.acceptableValue && i.performance === "desc")) {
      return '#e84949ab';
    } else if ((i && v < i.targetValue && i.performance === "asc") || (i && v > i.targetValue && i.performance === "asc")) {
      return '#5e8000b5';
    } else {
      return '#008000c7';
    }

  }

  chartOptions: any;

  ileft() {
    var li = this.department.indicators?.filter(a => this.redundant.indexOf(a.name) === -1);
    return li;
  }
}
