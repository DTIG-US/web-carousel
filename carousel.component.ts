import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CarouselComponent as NgxCarouselEase } from 'ngx-carousel-ease';
import * as siteData from '../../data.json';

@Component({
  selector: 'app-carousel',
  imports: [CommonModule, NgxCarouselEase],
  templateUrl: './carousel.component.html',
  styleUrls: ['./carousel.component.css']
})
export class CarouselComponent implements OnInit, AfterViewInit {
  data = {
    carouselImage: 'https://placehold.co/170x45'
  }

  news: any = (siteData as any).default;

  ngOnInit() {
  }

  ngAfterViewInit() {
    // Force ngx-carousel-ease to recalculate dimensions after DOM layout
    setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    }, 100);
  }
}
