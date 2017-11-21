import {Component, OnInit} from '@angular/core';
import {SiteAdminComponent} from '../site-admin/site-admin.component';

@Component({
  selector: 'app-site-navigation',
  templateUrl: './site-navigation.component.html',
  styleUrls: ['./site-navigation.component.scss']
})
export class SiteNavigationComponent extends SiteAdminComponent implements OnInit {

  ngOnInit() {
    this.onChildInit();
  }
}
