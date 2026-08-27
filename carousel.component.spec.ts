// Patch ngOnDestroy before Angular DI runs – without this, teardown throws
// in JSDOM because the library tries to remove real window event listeners.
import { CarouselComponent as NgxCarouselEase } from 'ngx-carousel-ease';
NgxCarouselEase.prototype.ngOnDestroy = function () {};

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CarouselComponent } from './carousel.component';
import * as siteData from '../../data.json';

// ---------------------------------------------------------------------------
// Helper: collect all text from Angular-injected <style> tags.
// JSDOM does not compute CSS from external files, but Angular's test
// compiler inlines component styles as <style> tags we CAN read.
// ---------------------------------------------------------------------------
function getInjectedStyles(): string {
  return Array.from(document.querySelectorAll('style'))
    .map((s) => s.textContent ?? '')
    .join('\n');
}

describe('CarouselComponent', () => {
  let component: CarouselComponent;
  let fixture: ComponentFixture<CarouselComponent>;
  let host: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CarouselComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CarouselComponent);
    component = fixture.componentInstance;
    host = fixture.nativeElement as HTMLElement;
    fixture.detectChanges();
  });

  // ── Smoke ────────────────────────────────────────────────────────────────

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // ── Data wiring ──────────────────────────────────────────────────────────

  it('should expose carousel items from data.json', () => {
    const expected = (siteData as any).default.carousel;
    expect(component.news.carousel.length).toBe(expected.length);
  });

  it('should expose news items from data.json', () => {
    const expected = (siteData as any).default.news;
    expect(component.news.news.length).toBe(expected.length);
  });

  // ── Template structure ───────────────────────────────────────────────────

  it('should render the <carousel> library element', () => {
    expect(host.querySelector('carousel')).toBeTruthy();
  });

  it('should render one .carousel-slide per data item (or more for infinite clones)', () => {
    const slides = host.querySelectorAll('.carousel-slide');
    expect(slides.length).toBeGreaterThanOrEqual(component.news.carousel.length);
  });

  it('should bind background-image on each .carousel-slide.slide from item.image', () => {
    const slides = host.querySelectorAll<HTMLElement>('.carousel-slide.slide');
    slides.forEach((slide) => {
      // The [style.background-image] binding produces: url("images/...")
      expect(slide.style.backgroundImage).toMatch(/^url\(/);
    });
  });

  it('should render the news sidebar with the correct number of items', () => {
    const newsItems = host.querySelectorAll('.news-item');
    expect(newsItems.length).toBe(component.news.news.length);
  });

  it('should render news links with correct href and text', () => {
    const links = host.querySelectorAll<HTMLAnchorElement>('.news-link');
    const expected = (siteData as any).default.news;
    links.forEach((link, i) => {
      expect(link.getAttribute('href')).toBe(expected[i].url);
      expect(link.textContent?.trim()).toBe(expected[i].title);
    });
  });

  it('should open news links in a new tab with noopener', () => {
    const links = host.querySelectorAll<HTMLAnchorElement>('.news-link');
    links.forEach((link) => {
      expect(link.getAttribute('target')).toBe('_blank');
      expect(link.getAttribute('rel')).toContain('noopener');
    });
  });

  // ── CSS source-level guards ──────────────────────────────────────────────
  // JSDOM cannot compute layout, so we assert that the critical ::ng-deep
  // rules are present in the inlined component stylesheet.  Accidentally
  // deleting any of these would reintroduce the visual bugs we fixed.

  describe('CSS layout guards (::ng-deep rules)', () => {
    let css: string;

    beforeEach(() => {
      css = getInjectedStyles();
    });

    it('should remove library padding from .carousel-container', () => {
      // The library defaults to padding:.2rem which creates a 2px gap
      // around the slide, causing slight misalignment with the news panel.
      expect(css).toMatch(/carousel-container[\s\S]*?padding:\s*0/);
    });

    it('should force .slides-container to 100% width (prevents 50%-wide slide bug)', () => {
      // Without this override, the library's grid+margin:auto constrains
      // the slides track to ~slideMaxWidth pixels, leaving dead space.
      expect(css).toMatch(/slides-container[\s\S]*?width:\s*100%/);
    });

    it('should force .carousel-slide to min-width:100% (prevents narrow slide bug)', () => {
      expect(css).toMatch(/carousel-slide[\s\S]*?min-width:\s*100%/);
    });

    it('should set background-size:cover on .carousel-slide (image fills slide)', () => {
      expect(css).toMatch(/carousel-slide[\s\S]*?background-size:\s*cover/);
    });

    it('should set background-position:center center on .carousel-slide', () => {
      expect(css).toMatch(/carousel-slide[\s\S]*?background-position:\s*center center/);
    });

    it('should collapse .banner-container height to 0 (controls were appearing above slide)', () => {
      // The library renders its banner (play/pause + arrows) in a flex row
      // ABOVE the slides in DOM order.  height:0 removes its layout footprint.
      expect(css).toMatch(/banner-container[\s\S]*?height:\s*0/);
    });

    it('should position .bullets-container as absolute overlay at center-bottom', () => {
      expect(css).toMatch(/bullets-container[\s\S]*?position:\s*absolute/);
      expect(css).toMatch(/bullets-container[\s\S]*?bottom:\s*16px/);
      expect(css).toMatch(/bullets-container[\s\S]*?left:\s*50%/);
      expect(css).toMatch(/bullets-container[\s\S]*?transform:\s*translateX\(-50%\)/);
    });

    it('should position .autoplay-container as absolute overlay at bottom-right', () => {
      expect(css).toMatch(/autoplay-container[\s\S]*?position:\s*absolute/);
      expect(css).toMatch(/autoplay-container[\s\S]*?bottom:\s*14px/);
      expect(css).toMatch(/autoplay-container[\s\S]*?right:\s*14px/);
    });
  });
});


