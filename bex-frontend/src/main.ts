import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.component.config';
import { App } from './app/app.component';

bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));
