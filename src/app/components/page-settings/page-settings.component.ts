import {Component, OnInit} from '@angular/core';
import {PageComponent} from '../page/page.component';

@Component({
  selector: 'app-page-settings',
  templateUrl: './page-settings.component.html',
  styleUrls: ['./page-settings.component.scss']
})
export class PageSettingsComponent extends PageComponent implements OnInit {

  ngOnInit() {
    super.ngOnInit();
    this.nav.displayNavbar(true);
  }

  save() {
    this.didClosePageSettings();
    this.exit();
  }

  exit() {
    this.router.navigate(['/p/' + this.page.id], {queryParams: {edit: true}});
  }
}
