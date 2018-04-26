import { TestBed, async, inject } from '@angular/core/testing';

import { OwnershipGuard } from './ownership.guard';

describe('OwnershipGuard', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [OwnershipGuard]
    });
  });

  it('should ...', inject([OwnershipGuard], (guard: OwnershipGuard) => {
    expect(guard).toBeTruthy();
  }));
});
