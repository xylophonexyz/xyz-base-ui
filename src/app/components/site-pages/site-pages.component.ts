import {Component, OnInit} from '@angular/core';
import {SiteAdminComponent} from '../site-admin/site-admin.component';

@Component({
  selector: 'app-site-pages',
  templateUrl: './site-pages.component.html',
  styleUrls: ['./site-pages.component.scss'],
})
export class SitePagesComponent extends SiteAdminComponent implements OnInit {

  ngOnInit() {
    this.onChildInit();
  }

}
