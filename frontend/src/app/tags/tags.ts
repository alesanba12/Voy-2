export interface TagDTO {
  readonly name: string;
}

export interface DeleteTagReqDTO {
  readonly tagName: string;
  readonly replacementTagName?: string;
}
