import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { DataTablesModule } from "angular-datatables";
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialogModule } from "@angular/material/dialog";
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatStepperModule } from '@angular/material/stepper';
import { MatTableModule } from '@angular/material/table';

import { AlertsComponent } from './component/alerts/alerts.component';
import { AppsComponent } from './component/apps/apps.component';
import { CollectionComponent } from './component/collection/collection.component';
import { DashboardComponent } from './component/dashboard/dashboard.component';
import { DepDetailComponent } from './component/dep-detail/dep-detail.component';
import { DepartementComponent } from './component/departement/departement.component';
import { HomeComponent } from './component/home/home.component';
import { IndicatorLibraryComponent } from './component/indicator-library/indicator-library.component';
import { IndicatorDetailsComponent } from './component/indicator-details/indicator-details.component';
import { IndicatorComponent } from './component/indicators/indicators.component';
import LoginComponent from './component/login/login.component';
import { ProgrammeComponent } from './component/programme/programme.component';
import { ScorecardComponent } from './component/scorecard/scorecard.component';
import { SideBarComponent } from './component/side-bar/side-bar.component';
import { TopBarComponent } from './component/top-bar/top-bar.component';
import { UserComponent } from './component/user/user.component';

import * as echarts from 'echarts';
import { NgxEchartsModule } from 'ngx-echarts';
import { AuthInterceptor, ErrorInterceptor } from './gaurd/auth.guard';

@NgModule({
  declarations: [
    AppComponent,
    SideBarComponent,
    TopBarComponent,
    DashboardComponent,
    UserComponent,
    IndicatorComponent,
    AppsComponent,
    IndicatorDetailsComponent,
    LoginComponent,
    HomeComponent,
    DepartementComponent,
    DepDetailComponent,
    CollectionComponent,
    ScorecardComponent,
    ProgrammeComponent,
    IndicatorLibraryComponent,
    AlertsComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatDialogModule,
    MatIconModule,
    MatFormFieldModule,
    MatTableModule,
    MatPaginatorModule,
    MatInputModule,
    MatCheckboxModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    DataTablesModule,
    MatSnackBarModule,
    MatButtonModule,
    MatStepperModule,
    NgxEchartsModule.forRoot({ echarts }),
  ],
  exports: [
    MatButtonModule,
    MatStepperModule,
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
