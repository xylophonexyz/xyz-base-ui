import {Injectable} from '@angular/core';
import {Headers, Http, Response} from '@angular/http';
import 'rxjs/add/operator/map';
import {Observable} from 'rxjs/Observable';
import {FileUploadService} from '../../modules/file-upload/file-upload.service';
import {ComponentDataInterface} from '../index';
import {ApiService} from './api.service';
import {AuthService} from './auth.service';

@Injectable()
export class ComponentService {

  static readonly POLLING_INTERVAL = 5000;

  constructor(protected http: Http,
              protected auth: AuthService,
              protected api: ApiService,
              protected fileUpload: FileUploadService) {
  }

  get(id: number): Observable<ComponentDataInterface> {
    const url = `${this.api.baseUrl}/components/${id}`;
    const headers = this.auth.constructAuthHeader();
    return this.http.get(url, {headers}).map((res: Response) => {
      return res.json() as ComponentDataInterface;
    });
  }

  update(id: number, params: ComponentDataInterface): Observable<ComponentDataInterface> {
    const url = `${this.api.baseUrl}/components/${id}`;
    const headers = this.auth.constructAuthHeader();
    return this.http.put(url, JSON.stringify(params), {headers}).map((res: Response) => {
      return res.json() as ComponentDataInterface;
    });
  }

  process(id: number): Observable<ComponentDataInterface> {
    return new Observable(observer => {
      const url = `${this.api.baseUrl}/components/${id}/process`;
      const headers = new Headers({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.auth.accessToken}`
      });

      let currentPoll;
      const poll = () => {
        this.get(id).subscribe((component: ComponentDataInterface) => {

          observer.next(component);
          clearTimeout(currentPoll);

          if (component.media_processing) {
            currentPoll = setTimeout(() => {
              poll();
            }, ComponentService.POLLING_INTERVAL);
          } else {
            observer.complete();
          }
        }, (err: Response) => {
          observer.error(err);
          observer.complete();
        });
      };

      this.http.post(url, null, {headers}).subscribe(() => {
        poll();
      }, (err: Response) => {
        observer.error(err);
        observer.complete();
      });
    });
  }

  upload(id: number, file: File): Observable<ComponentDataInterface> {
    return new Observable(subscriber => {
      const url = `${this.api.baseUrl}/components/${id}/upload`;
      const headers = new Headers({'Authorization': `Bearer ${this.auth.accessToken}`});
      // upload file
      this.fileUpload.upload(file, {
        url: url,
        headers: headers
      }).then(() => {
        // send request to start transcoding processes, update observable with status until complete
        this.process(id).subscribe((component: ComponentDataInterface) => {
          subscriber.next(component);
        }, err => {
          subscriber.error(err);
          subscriber.complete();
        }, () => {
          subscriber.complete();
        });
      }).catch(err => {
        subscriber.error(err);
        subscriber.complete();
      });
    });
  }

}
