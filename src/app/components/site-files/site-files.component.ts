import {Component, OnInit} from '@angular/core';
import {SiteAdminComponent} from '../site-admin/site-admin.component';

@Component({
  selector: 'app-site-files',
  templateUrl: './site-files.component.html',
  styleUrls: ['./site-files.component.scss']
})
export class SiteFilesComponent extends SiteAdminComponent implements OnInit {

  ngOnInit() {
    this.onChildInit();
  }

}
