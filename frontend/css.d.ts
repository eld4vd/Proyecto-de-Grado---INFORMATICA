// Allow CSS side-effect imports in TypeScript 6+
declare module '*.css' {
  const content: Record<string, string>;
  export default content;
}
