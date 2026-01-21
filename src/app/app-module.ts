import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule, HTTP_INTERCEPTORS, HttpClient } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';


import { JwtInterceptor } from './core/interceptors/jwt.interceptor';
import { AppComponent } from './app';
import { LoginComponent } from './components/login/login';
import { RegisterComponent } from './components/register/register';
import { GameComponent } from './components/game/game';
import { HistoryComponent } from './components/history/history';
import { StatisticsComponent } from './components/statistics/statistics';
import { NavbarComponent } from './shared/components/navbar/navbar';
import { AppRoutingModule } from './app-routing-module';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader();
}
@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    RegisterComponent,
    GameComponent,
    HistoryComponent,
    StatisticsComponent,
    NavbarComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,           // Add this for [(ngModel)]
    ReactiveFormsModule,   // For reactive forms
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    }),
  
    HttpClientModule,
    ReactiveFormsModule,
    BrowserAnimationsModule
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: JwtInterceptor,
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }