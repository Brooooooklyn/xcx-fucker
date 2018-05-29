import * as CSS from 'csstype'

export type ReactType<P = any> = string | ComponentType<P>
export type ComponentType<P = {}> = ComponentClass<P> | StatelessComponent<P>

type Key = string | number

// tslint:disable-next-line:interface-over-type-literal
type ComponentState = {}

type XCXEvent = {}

interface Attributes {
  key?: Key
  bindtap?: (e: XCXEvent) => any
}

interface XCXElement<P> {
  type: string | ComponentClass<P> | SFC<P>
  props: P
  key: Key | null
}

interface SFCElement<P> extends XCXElement<P> {
  type: SFC<P>
}

type CElement<P, T extends Component<P, ComponentState>> = ComponentElement<P, T>
interface ComponentElement<P, T extends Component<P, ComponentState>> extends XCXElement<P> {
  type: ComponentClass<P>
  ref?: Ref<T>
}

//
// React Nodes
// http://facebook.github.io/react/docs/glossary.html
// ----------------------------------------------------------------------

type ReactText = string | number
type ReactChild = XCXElement<any> | ReactText

// Should be Array<ReactNode> but type aliases cannot be recursive
type ReactFragment = {} | Array<ReactChild | any[] | boolean>
type ReactNode = ReactChild | ReactFragment | string | number | boolean | null | undefined

//
// Component API
// ----------------------------------------------------------------------

type ReactInstance = Component<any> | Element

// Base component for plain JS classes
// tslint:disable-next-line:no-empty-interface
export type PropTypesLiteray = String | Number | Boolean | Object | Array | null
export interface Component<P = {}, S = {}, SS = any> extends ComponentLifecycle<P, S, SS> {}
export abstract class Component<P, S> {
  abstract propTypes: {
    [index: string]: {
      type: PropTypesLiteray
      defaultValue: any
    }
  }

  constructor(props: P, context?: any)

  // We MUST keep setState() as a unified signature because it allows proper checking of the method return type.
  // See: https://github.com/DefinitelyTyped/DefinitelyTyped/issues/18365#issuecomment-351013257
  // Also, the ` | S` allows intellisense to not be dumbisense
  setState<K extends keyof S>(
    state: ((prevState: Readonly<S>, props: P) => Pick<S, K> | S | null) | (Pick<S, K> | S | null),
    callback?: () => void,
  ): void

  forceUpdate(callBack?: () => void): void
  render(): ReactNode

  // React.Props<T> is now deprecated, which means that the `children`
  // property is not available on `P` by default, even though you can
  // always pass children as variadic arguments to `createElement`.
  // In the future, if we can define its call signature conditionally
  // on the existence of `children` in `P`, then we should remove this.
  props: Readonly<{ children?: ReactNode }> & Readonly<P>
  state: Readonly<S>
  context: any
  refs: {
    [key: string]: ReactInstance
  }
}

class PureComponent<P = {}, S = {}, SS = any> extends Component<P, S, SS> {}

interface ClassicComponent<P = {}, S = {}> extends Component<P, S> {
  replaceState(nextState: S, callback?: () => void): void
  isMounted(): boolean
  getInitialState?(): S
}

interface ChildContextProvider<CC> {
  getChildContext(): CC
}

//
// Class Interfaces
// ----------------------------------------------------------------------

interface ComponentClass<P = {}> extends StaticLifecycle<P, any> {
  new (props: P, context?: any): Component<P, ComponentState>
  propTypes?: ValidationMap<P>
  contextTypes?: ValidationMap<any>
  childContextTypes?: ValidationMap<any>
  defaultProps?: Partial<P>
  displayName?: string
}

interface ClassicComponentClass<P = {}> extends ComponentClass<P> {
  new (props: P, context?: any): ClassicComponent<P, ComponentState>
  getDefaultProps?(): P
}

/**
 * We use an intersection type to infer multiple type parameters from
 * a single argument, which is useful for many top-level API defs.
 * See https://github.com/Microsoft/TypeScript/issues/7234 for more info.
 */
type ClassType<P, T extends Component<P, ComponentState>, C extends ComponentClass<P>> = C &
  (new (props: P, context?: any) => T) &
  (new (props: P, context?: any) => { props: P })

//
// Component Specs and Lifecycle
// ----------------------------------------------------------------------

// as React will _not_ call the deprecated lifecycle methods if any of the new lifecycle
// methods are present.
interface ComponentLifecycle<P, S, SS = never> extends NewLifecycle<P, S, SS> {
  /**
   * Called immediately after a compoment is mounted. Setting state here will trigger re-rendering.
   */
  componentDidMount?(): void
  /**
   * Called to determine whether the change in props and state should trigger a re-render.
   *
   * `Component` always returns true.
   * `PureComponent` implements a shallow comparison on props and state and returns true if any
   * props or states have changed.
   *
   * If false is returned, `Component#render`, `componentWillUpdate`
   * and `componentDidUpdate` will not be called.
   */
  shouldComponentUpdate?(nextProps: Readonly<P>, nextState: Readonly<S>, nextContext: any): boolean
  /**
   * Called immediately before a component is destroyed. Perform any necessary cleanup in this method, such as
   * cancelled network requests, or cleaning up any DOM elements created in `componentDidMount`.
   */
  componentWillUnmount?(): void
  /**
   * Catches exceptions generated in descendant components. Unhandled exceptions will cause
   * the entire component tree to unmount.
   */
  componentDidCatch?(error: Error, errorInfo: ErrorInfo): void
}

// Unfortunately, we have no way of declaring that the component constructor must implement this
interface StaticLifecycle<P, S> {
  getDerivedStateFromProps?: GetDerivedStateFromProps<P, S>
}

type GetDerivedStateFromProps<P, S> =
  /**
   * Returns an update to a component's state based on its new props and old state.
   *
   * Note: its presence prevents any of the deprecated lifecycle methods from being invoked
   */
  (nextProps: Readonly<P>, prevState: S) => Partial<S> | null

// This should be "infer SS" but can't use it yet
interface NewLifecycle<P, S, SS> {
  /**
   * Runs before React applies the result of `render` to the document, and
   * returns an object to be given to componentDidUpdate. Useful for saving
   * things such as scroll position before `render` causes changes to it.
   *
   * Note: the presence of getSnapshotBeforeUpdate prevents any of the deprecated
   * lifecycle events from running.
   */
  getSnapshotBeforeUpdate?(prevProps: Readonly<P>, prevState: Readonly<S>): SS | null
  /**
   * Called immediately after updating occurs. Not called for the initial render.
   *
   * The snapshot is only present if getSnapshotBeforeUpdate is present and returns non-null.
   */
  componentDidUpdate?(prevProps: Readonly<P>, prevState: Readonly<S>, snapshot?: SS): void
}

interface Mixin<P, S> extends ComponentLifecycle<P, S> {
  mixins?: Array<Mixin<P, S>>
  statics?: {
    [key: string]: any
  }

  displayName?: string
  propTypes?: ValidationMap<any>
  contextTypes?: ValidationMap<any>
  childContextTypes?: ValidationMap<any>

  getDefaultProps?(): P
  getInitialState?(): S
}

interface ComponentSpec<P, S> extends Mixin<P, S> {
  render(): ReactNode

  [propertyName: string]: any
}

//
// Props / DOM Attributes
// ----------------------------------------------------------------------

/**
 * @deprecated. This was used to allow clients to pass `ref` and `key`
 * to `createElement`, which is no longer necessary due to intersection
 * types. If you need to declare a props object before passing it to
 * `createElement` or a factory, use `ClassAttributes<T>`:
 *
 * ```ts
 * var b: Button | null;
 * var props: ButtonProps & ClassAttributes<Button> = {
 *     ref: b => button = b, // ok!
 *     label: "I'm a Button"
 * };
 * ```
 */
interface Props<T> {
  children?: ReactNode
  key?: Key
}

export interface CSSProperties extends CSS.Properties<string | number> {
  /**
   * The index signature was removed to enable closed typing for style
   * using CSSType. You're able to use type assertion or module augmentation
   * to add properties or an index signature of your own.
   *
   * For examples and more information, visit:
   * https://github.com/frenic/csstype#what-should-i-do-when-i-get-type-errors
   */
}

//
// React.Children
// ----------------------------------------------------------------------

interface ReactChildren {
  map<T>(children: ReactNode, fn: (child: ReactChild, index: number) => T): T[]
  forEach(children: ReactNode, fn: (child: ReactChild, index: number) => void): void
  count(children: ReactNode): number
  only(children: ReactNode): XCXElement<any>
  toArray(children: ReactNode): ReactChild[]
}

//
// Error Interfaces
// ----------------------------------------------------------------------
interface ErrorInfo {
  /**
   * Captures which component contained the exception, and its ancestors.
   */
  componentStack: string
}

declare global {
  namespace JSX {
    // tslint:disable-next-line:no-empty-interface
    interface Element extends React.XCXElement<any> {}
    interface ElementClass extends React.Component<any> {
      render(): React.ReactNode
    }
    interface ElementAttributesProperty {
      props: {}
    }
    interface ElementChildrenAttribute {
      children: {}
    }

    // tslint:disable-next-line:no-empty-interface
    interface IntrinsicAttributes extends React.Attributes {}
    // tslint:disable-next-line:no-empty-interface
    interface IntrinsicClassAttributes<T> extends React.ClassAttributes<T> {}

    interface IntrinsicElements {
      view: Attributes & {
        hoverClass?: string
      }

      button: Attributes & {
        size?: string
        type?: string
      }
    }
  }
}
