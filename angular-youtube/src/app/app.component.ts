import { Component } from '@angular/core';
import { YoutubeService } from './youtube.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'angular-youtube';

  formData = {
    url: ''
  };

  constructor(private serviceObj: YoutubeService) {

  }

  /**
   * get video details
   */
  getVideoDetails() {
    this.serviceObj.getVideoDetails(this.formData.url)?.subscribe(response => {

    });
  }
}
