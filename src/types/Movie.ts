export interface EditMovieInfo {
  id: number;
  url: string;
  name: string;
  type: string;
  headers: { [key: string]: string };
}
