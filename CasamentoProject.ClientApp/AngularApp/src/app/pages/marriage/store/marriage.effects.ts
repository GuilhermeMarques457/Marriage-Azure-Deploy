import { Actions, createEffect, ofType } from '@ngrx/effects';
import * as MarriageActions from './marriage.actions';
import { catchError, map, of, switchMap } from 'rxjs';
import { Marriage } from '../marriage.model';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { API_URL_MARRIAGE } from '../../../shared/utils/api_urls';
import { setMarriages } from './marriage.actions';
import { setMarriage } from './marriage.actions';
import { ErrorResponse } from '../../../shared/utils/error-response.model';

const handleError = (response: ErrorResponse) => {
  let error = new ErrorResponse(
    'Um erro inesperado ocorreu',
    'Contate a central de ajuda para mais informações',
    '400'
  );

  if (!response.error)
    return of(MarriageActions.errorHandlerMarriage({ error: error }));

  if (response.error.Details) error = response;

  return of(MarriageActions.errorHandlerMarriage({ error: error }));
};

@Injectable()
export class MarriageEffects {
  constructor(private actions$: Actions, private http: HttpClient) {}

  private API_URL_BASE = API_URL_MARRIAGE;

  getMarriages = createEffect(() =>
    this.actions$.pipe(
      ofType(MarriageActions.getMarriages),
      switchMap(() =>
        this.http.get<Marriage[]>(`${this.API_URL_BASE}/get-marriages`).pipe(
          map((marriages: Marriage[]) => {
            return setMarriages({ Marriages: marriages });
          }),
          catchError((err) => handleError(err))
        )
      )
    )
  );

  getMarriage = createEffect(() =>
    this.actions$.pipe(
      ofType(MarriageActions.getMarriage),
      switchMap((action) =>
        this.http
          .get<Marriage>(`${this.API_URL_BASE}/get-marriage/${action.id}`)
          .pipe(
            map((Marriage: Marriage) => {
              return setMarriage({ Marriage: Marriage });
            }),
            catchError((err) => handleError(err))
          )
      )
    )
  );

  addMarriage = createEffect(() =>
    this.actions$.pipe(
      ofType(MarriageActions.addMarriage),
      switchMap((action) =>
        this.http
          .post<Marriage>(`${this.API_URL_BASE}/post-marriage`, action.Marriage)
          .pipe(
            map((Marriage: Marriage) => {
              console.log(Marriage);
              return setMarriage({ Marriage: Marriage });
            }),
            catchError((err) => handleError(err))
          )
      )
    )
  );

  updateMarriage = createEffect(() =>
    this.actions$.pipe(
      ofType(MarriageActions.updateMarriage),
      switchMap((action) =>
        this.http
          .put<Marriage>(`${this.API_URL_BASE}/put-marriage`, action.Marriage)
          .pipe(
            map((Marriage: Marriage) => {
              return setMarriage({ Marriage: Marriage });
            }),
            catchError((err) => handleError(err))
          )
      )
    )
  );

  deleteMarriage = createEffect(() =>
    this.actions$.pipe(
      ofType(MarriageActions.deleteMarriage),
      switchMap((action) =>
        this.http
          .delete<boolean>(`${this.API_URL_BASE}/delete-marriage/${action.id}`)
          .pipe(
            map((isDeleted: boolean) => {
              return setMarriage({ Marriage: null });
            }),
            catchError((err) => handleError(err))
          )
      )
    )
  );
}
