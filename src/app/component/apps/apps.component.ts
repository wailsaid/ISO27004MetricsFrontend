import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { App, AppsService } from 'src/app/service/apps/apps.service';
@Component({
  standalone: false,
  selector: 'app-apps',
  templateUrl: './apps.component.html',
  styleUrls: ['./apps.component.css']
})
export class AppsComponent implements OnInit, OnDestroy {



  appname !: string;

  apps: App[] = [];
  private sub1 !: Subscription;
  private sub2 !: Subscription;
  private sub3 !: Subscription;
  constructor(private appsService: AppsService,) { }

  ngOnInit(): void {

    this.sub1 = this.appsService.getApps().subscribe((data) => {
      this.apps = data
    });
  }
  ngOnDestroy(): void {
    this.sub1?.unsubscribe();
    this.sub2?.unsubscribe();
    this.sub3?.unsubscribe();
  }

  deleteApp(app: App) {
    this.sub2 = this.appsService.deleteApp(app).subscribe(() =>
      this.apps = this.apps.filter(a => a.id !== app.id)
    );
  }
  addApp() {

    const app: App = {
      "name": this.appname
    }
    this.sub3 = this.appsService.CreateApp(app).subscribe((a) => {
      this.apps.push(a);
      this.appname = "";


    });

  }



}
