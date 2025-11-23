declare module 'backendless' {
  export class User {
    objectId?: string;
    [key: string]: any;
  }
  
  const Backendless: any;
  export default Backendless;
}
