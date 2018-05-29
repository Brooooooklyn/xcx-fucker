import * as React from 'react'

export class ViewComponent extends React.PureComponent {
  static defaultProps = {
    hoverStopPropagation: false,
    hoverStartTime: 50,
    hoverStayTime: 400,
  }

  render() {
    return <div onMouseEnter={} onMouseLeave={} />
  }
}
