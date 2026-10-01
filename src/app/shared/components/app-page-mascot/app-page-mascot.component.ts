import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  PLATFORM_ID,
  inject,
  signal,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { fromEvent } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-page-mascot',
  standalone: true,
  templateUrl: './app-page-mascot.component.html',
  styleUrl: './app-page-mascot.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageMascotComponent {
  private readonly elementRef = inject(ElementRef<HTMLElement>);
  private readonly destroyRef = inject(DestroyRef);
  private readonly platformId = inject(PLATFORM_ID);

  readonly directionIndex = signal(4);
  readonly reactionIndex = signal(4);
  readonly isReacting = signal(false);

  private reactionTimer?: ReturnType<typeof setTimeout>;
  private reactionCursor = 0;

  private readonly reactionSequence = [1, 4, 5, 7, 8];

  /**
   * Sprite layout:
   *
   * 0  1  2
   * 3  4  5
   * 6  7  8
   */
  private readonly spritePositions = [
    '0% 0%',
    '50% 0%',
    '100% 0%',
    '0% 50%',
    '50% 50%',
    '100% 50%',
    '0% 100%',
    '50% 100%',
    '100% 100%',
  ];

  constructor() {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    this.setupPointerTracking();
  }

  getDirectionPosition(): string {
    return this.spritePositions[this.directionIndex()] ?? '50% 50%';
  }

  getReactionPosition(): string {
    return this.spritePositions[this.reactionIndex()] ?? '50% 50%';
  }

  private setupPointerTracking(): void {
    const finePointer = window.matchMedia('(pointer: fine)').matches;

    if (!finePointer) {
      return;
    }

    fromEvent<MouseEvent>(document, 'mousemove')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((event) => {
        this.updateDirection(event.clientX, event.clientY);
      });
  }

  private updateDirection(cursorX: number, cursorY: number): void {
    if (this.isReacting()) {
      return;
    }

    const mascot = this.elementRef.nativeElement.getBoundingClientRect();

    const centerX = mascot.left + mascot.width / 2;
    const centerY = mascot.top + mascot.height / 2;

    const dx = cursorX - centerX;
    const dy = cursorY - centerY;

    const distance = Math.sqrt(dx * dx + dy * dy);

    // Cursor quá gần mascot -> nhìn thẳng
    if (distance < 80) {
      this.directionIndex.set(4);
      return;
    }

    const angle = Math.atan2(dy, dx) * (180 / Math.PI);

    this.directionIndex.set(this.getDirectionIndex(angle));
  }

  private getDirectionIndex(angle: number): number {
    if (angle >= -22.5 && angle < 22.5) {
      return 5; // right
    }

    if (angle >= 22.5 && angle < 67.5) {
      return 8; // bottom-right
    }

    if (angle >= 67.5 && angle < 112.5) {
      return 7; // bottom
    }

    if (angle >= 112.5 && angle < 157.5) {
      return 6; // bottom-left
    }

    if (angle >= 157.5 || angle < -157.5) {
      return 3; // left
    }

    if (angle >= -157.5 && angle < -112.5) {
      return 0; // top-left
    }

    if (angle >= -112.5 && angle < -67.5) {
      return 1; // top
    }

    return 2; // top-right
  }

  onMascotClick(): void {
    this.reactionCursor =
      (this.reactionCursor + 1) % this.reactionSequence.length;

    this.reactionIndex.set(
      this.reactionSequence[this.reactionCursor],
    );

    this.isReacting.set(true);

    if (this.reactionTimer) {
      clearTimeout(this.reactionTimer);
    }

    this.reactionTimer = setTimeout(() => {
      this.isReacting.set(false);
      this.reactionIndex.set(4);
    }, 550);
  }
}