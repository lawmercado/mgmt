import { Component } from '@angular/core';

import { Platform } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { DatabaseService } from 'src/services/database.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html'
})
export class AppComponent {
  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    private db: DatabaseService

  ) {
    this.initializeApp();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.styleLightContent();
      this.statusBar.backgroundColorByHexString('#002f6c');
      this.db.createDatabase().then(
        () => {
          console.log('Database created successfully');
        }
      )
      .catch(
        (err) => {
          console.error('Error when creating the database!');
          console.error(err);
        }
      )
      .finally(
        () => {
          this.splashScreen.hide();
        }
      );
    });
  }
}
