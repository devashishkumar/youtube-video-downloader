import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class YoutubeService {

  private serviceUrl = 'localhost:3000/youtube/'

  constructor(private httpObj: HttpClient) { }

  /**
   * get youtube video details
   * @param url string
   * @returns 
   */
   getVideoDetails(url = '') {
     if (!url) return;
     return this.httpObj.get(`${this.serviceUrl}getvideodetails/${url}`);
   }
}
