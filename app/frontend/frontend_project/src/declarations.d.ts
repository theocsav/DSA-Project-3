declare module "*.css";
declare module "*.png";
declare module "*.jpg";
declare module "*.svg" {
  const content: React.FunctionComponent<React.SVGAttributes<SVGElement>>;
  export default content;
}
