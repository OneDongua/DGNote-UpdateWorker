export interface DownloadLink {
  link: string;
  pwd: string;
  desc?: string;
}

export interface VersionInfo {
  name: string;
  code: number;
  logs: string;
  links: DownloadLink[];
}