import * as React from 'react';
import {Route, Link, match} from 'react-router-dom';
import {Location} from 'history';

export interface NavLinkProps extends React.HTMLAttributes<HTMLAnchorElement> {
  /**
   * The class name used when the current location matches the "to" property.
   * Defaults to "active"
   */
  activeClassName?: string;
  /**
   * Styles to apply when the current location matches the "to" property.
   */
  activeStyle?: React.CSSProperties;
  /**
   * By default "/foo/bar" will match a "to" property of "/foo". Set exact
   * if you don't want it to count as "active" on child pages.
   */
  exact?: boolean;
  /**
   * Bypass react-router and do a full page navigation. Enabled automatically if
   * the "to" property starts with "http://", "https://" or "mailto:"
   */
  external?: boolean;
  /**
   * Set this to `true` to force a file to be downloaded rather than opened
   * directly.
   */
  download?: boolean | string;
  /**
   * Override the default test for whether the route is "active"
   */
  isActive?:
    | boolean
    | ((match: match<any> | null, location: Location) => boolean);
  /**
   * The "location" is used to determine whether the link is active. By default
   * it is found from the context using react-router.
   */
  location?: Location;
  /**
   * Set the target="_blank" and rel="noopener noreferrer"
   */
  openInNewTab?: boolean;
  rel?: string;
  /**
   * When clicked, this button replaces the current page in history. i.e. the back button
   * will skip the current page.
   */
  replace?: boolean;
  /**
   * Don't count "/foo/" as the same URL as "/foo"
   */
  strict?: boolean;
  /**
   * The URL that this button should navigate to.
   */
  to?: string;
}
export interface ButtonHTMLAttributes
  extends React.HTMLAttributes<HTMLButtonElement> {
  autoFocus?: boolean;
  disabled?: boolean;
  form?: string;
  formAction?: string;
  formEncType?: string;
  formMethod?: 'post' | 'get';
  formNoValidate?: boolean;
  formTarget?: string;
  name?: string;
  /**
   * type defaults to "button", if you set it to "submit" or "reset" it will have the
   * corresponding action on the form element containing it.
   */
  type?: 'submit' | 'reset' | 'button';
  value?: string | string[] | number;
}
export type AbstractButtonProps = NavLinkProps & ButtonHTMLAttributes;
export default function AbstractButton(props: AbstractButtonProps) {
  const {
    activeClassName: customActiveClassName,
    activeStyle,
    'aria-current': ariaCurrent,
    className,
    exact,
    strict,
    location,
    isActive: getIsActive,
    style,
    to,
    external,
    openInNewTab,
    ...rest
  } = props;
  const activeClassName = customActiveClassName || 'active';
  if (to) {
    // Regex taken from: https://github.com/pillarjs/path-to-regexp/blob/master/index.js#L202
    const escapedPath = to.replace(/([.+*?=^!:${}()[\]|/\\])/g, '\\$1');
    return (
      <Route
        path={escapedPath}
        exact={exact}
        strict={strict}
        location={location}
        children={({location, match}) => {
          const isActive = !!(typeof getIsActive === 'function'
            ? getIsActive(match, location)
            : typeof getIsActive === 'boolean' ? getIsActive : match);

          if (
            external ||
            openInNewTab ||
            props.download ||
            (to && (/^https?\:\/\//.test(to) || /^mailto\:/.test(to)))
          ) {
            return (
              <a
                href={to}
                target={openInNewTab ? '_blank' : undefined}
                rel={openInNewTab ? 'noopener noreferrer' : undefined}
                className={
                  isActive
                    ? [className, activeClassName].filter(i => i).join(' ')
                    : className
                }
                style={isActive ? {...style, ...activeStyle} : style}
                aria-current={(isActive && ariaCurrent) || undefined}
                {...rest}
                onMouseUp={e => {
                  if ((e.target as any).blur) (e.target as any).blur();
                  if (props.onMouseUp) props.onMouseUp(e);
                }}
              />
            );
          }
          return (
            <ServiceWorkerUpdated>
              {external => {
                if (external) {
                  return (
                    <a
                      href={to}
                      className={
                        isActive
                          ? [className, activeClassName]
                              .filter(i => i)
                              .join(' ')
                          : className
                      }
                      style={isActive ? {...style, ...activeStyle} : style}
                      aria-current={(isActive && ariaCurrent) || undefined}
                      {...rest}
                      onMouseUp={e => {
                        if ((e.target as any).blur) (e.target as any).blur();
                        if (props.onMouseUp) props.onMouseUp(e);
                      }}
                    />
                  );
                }
                return (
                  <Link
                    to={to}
                    className={
                      isActive
                        ? [className, activeClassName].filter(i => i).join(' ')
                        : className
                    }
                    style={isActive ? {...style, ...activeStyle} : style}
                    aria-current={(isActive && ariaCurrent) || undefined}
                    {...rest}
                    onMouseUp={e => {
                      if ((e.target as any).blur) (e.target as any).blur();
                      if (props.onMouseUp) props.onMouseUp(e);
                    }}
                  />
                );
              }}
            </ServiceWorkerUpdated>
          );
        }}
      />
    );
  }
  if (typeof getIsActive === 'function') {
    return (
      <Route
        exact={exact}
        strict={strict}
        location={location}
        children={({location, match}) => {
          const isActive = !!(typeof getIsActive === 'function'
            ? getIsActive(match, location)
            : typeof getIsActive === 'boolean' ? getIsActive : false);
          return (
            <button
              type="button"
              className={
                isActive
                  ? [className, activeClassName].filter(i => i).join(' ')
                  : className
              }
              style={isActive ? {...style, ...activeStyle} : style}
              {...rest}
              onMouseUp={e => {
                if ((e.target as any).blur) (e.target as any).blur();
                if (props.onMouseUp) props.onMouseUp(e);
              }}
            />
          );
        }}
      />
    );
  }
  const isActive = !!(typeof getIsActive === 'boolean' ? getIsActive : false);
  return (
    <button
      type="button"
      className={
        isActive
          ? [className, activeClassName].filter(i => i).join(' ')
          : className
      }
      style={isActive ? {...style, ...activeStyle} : style}
      {...rest}
      onMouseUp={e => {
        if ((e.target as any).blur) (e.target as any).blur();
        if (props.onMouseUp) props.onMouseUp(e);
      }}
    />
  );
}

let waitingForServiceWorkerUpdate: (() => void)[] | null = [];
export function makeAllLinksExternal() {
  if (waitingForServiceWorkerUpdate) {
    const handlers = waitingForServiceWorkerUpdate;
    waitingForServiceWorkerUpdate = null;
    handlers.forEach(fn => fn());
  }
}

interface ServiceWorkerUpdatedProps {
  children: (serviceWorkerUpdated: boolean) => React.ReactNode;
}
class ServiceWorkerUpdated extends React.Component<ServiceWorkerUpdatedProps> {
  state = {serviceWorkerUpdated: waitingForServiceWorkerUpdate === null};
  componentDidMount() {
    if (waitingForServiceWorkerUpdate) {
      waitingForServiceWorkerUpdate.push(this._updated);
    }
  }
  componentWillUnmount() {
    if (waitingForServiceWorkerUpdate) {
      const index = waitingForServiceWorkerUpdate.indexOf(this._updated);
      if (index !== -1) {
        waitingForServiceWorkerUpdate.splice(index, 1);
      }
    }
  }
  _updated = () => {
    this.setState({serviceWorkerUpdated: true});
  };
  render() {
    return this.props.children(this.state.serviceWorkerUpdated);
  }
}

module.exports = AbstractButton;
module.exports.default = AbstractButton;
module.exports.makeAllLinksExternal = makeAllLinksExternal;
