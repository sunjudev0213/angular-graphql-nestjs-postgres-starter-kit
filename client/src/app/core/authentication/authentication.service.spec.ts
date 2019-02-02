import { TestBed, inject, fakeAsync, tick } from '@angular/core/testing';

import { AuthenticationService, Credentials } from './authentication.service';
import { MockAuthenticationService } from '@app/core/authentication/authentication.service.mock';

const credentialsKey = 'credentials';

describe('AuthenticationService', () => {
  let authenticationService: AuthenticationService;
  const mockAuthenticationService: MockAuthenticationService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AuthenticationService]
    });
  });

  beforeEach(inject([AuthenticationService], (_authenticationService: AuthenticationService) => {
    authenticationService = _authenticationService;
  }));

  afterEach(() => {
    // Cleanup
    localStorage.removeItem(credentialsKey);
    sessionStorage.removeItem(credentialsKey);
  });

  describe('login', () => {
    it('should return credentials', fakeAsync(() => {
      // Act
      const request = authenticationService.login({
        username: 'toto',
        password: '123'
      });
      tick();

      // Assert
      request.subscribe(credentials => {
        expect(credentials).toBeDefined();
        expect(credentials.token).toBeDefined();
      });
    }));

    it('should authenticate users', fakeAsync(() => {
      expect(mockAuthenticationService.isAuthenticated()).toBe(false);

      // Act
      const request = authenticationService.login({
        username: 'toto',
        password: '123'
      });
      tick();

      // Assert
      request.subscribe(() => {
        expect(mockAuthenticationService.isAuthenticated()).toBe(true);
        expect(authenticationService.credentials).toBeDefined();
        expect(authenticationService.credentials).not.toBeNull();
        expect((<Credentials>authenticationService.credentials).token).toBeDefined();
        expect((<Credentials>authenticationService.credentials).token).not.toBeNull();
      });
    }));

    it('should persist credentials for the session', fakeAsync(() => {
      // Act
      const request = authenticationService.login({
        username: 'toto',
        password: '123'
      });
      tick();

      // Assert
      request.subscribe(() => {
        expect(sessionStorage.getItem(credentialsKey)).not.toBeNull();
      });
    }));

    it('should persist credentials across sessions', fakeAsync(() => {
      // Act
      const request = authenticationService.login({
        username: 'toto',
        password: '123',
        remember: true
      });
      tick();

      // Assert
      request.subscribe(() => {
        expect(localStorage.getItem(credentialsKey)).not.toBeNull();
      });
    }));
  });

  describe('logout', () => {
    it('should clear users authentication', fakeAsync(() => {
      // Arrange
      const loginRequest = authenticationService.login({
        username: 'toto',
        password: '123'
      });
      tick();

      // Assert
      loginRequest.subscribe(() => {
        expect(mockAuthenticationService.isAuthenticated()).toBe(true);

        const request = authenticationService.logout();
        tick();

        request.subscribe(() => {
          expect(mockAuthenticationService.isAuthenticated()).toBe(false);
          expect(authenticationService.credentials).toBeNull();
          expect(sessionStorage.getItem(credentialsKey)).toBeNull();
          expect(localStorage.getItem(credentialsKey)).toBeNull();
        });
      });
    }));

    it('should clear persisted users authentication', fakeAsync(() => {
      // Arrange
      const loginRequest = authenticationService.login({
        username: 'toto',
        password: '123',
        remember: true
      });
      tick();

      // Assert
      loginRequest.subscribe(() => {
        expect(mockAuthenticationService.isAuthenticated()).toBe(true);

        const request = authenticationService.logout();
        tick();

        request.subscribe(() => {
          expect(mockAuthenticationService.isAuthenticated()).toBe(false);
          expect(authenticationService.credentials).toBeNull();
          expect(sessionStorage.getItem(credentialsKey)).toBeNull();
          expect(localStorage.getItem(credentialsKey)).toBeNull();
        });
      });
    }));
  });
});
