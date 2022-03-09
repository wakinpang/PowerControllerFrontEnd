import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})

export class AdminComponent implements OnInit {
  constructor(private router: Router) {

  }

  current = 0;
  opened = true;
  mode = 'side';

  ngOnInit() {
    function detectmob() {
      if (navigator.userAgent.match(/Android/i)
        || navigator.userAgent.match(/webOS/i)
        || navigator.userAgent.match(/iPhone/i)
        || navigator.userAgent.match(/iPad/i)
        || navigator.userAgent.match(/iPod/i)
        || navigator.userAgent.match(/BlackBerry/i)
        || navigator.userAgent.match(/Windows Phone/i)
      ) {
        return true;
      } else {
        return false;
      }
    }

    if (detectmob()) {
      this.mode = 'over';
      this.opened = false;
    }
  }

  onLogout() {
    this.router.navigate(['/login'], {replaceUrl: true});
    this.current = 0;
  }

  toggleSidebar() {
    this.opened = !this.opened;
  }

  onNavigate(path: string = '/admin', id: number = 0) {
    this.router.navigate([path]);
    this.current = id;
  }
}
