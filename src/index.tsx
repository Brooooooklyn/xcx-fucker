import { PureComponent } from './interface'
interface FooProps {
  foo: number[]
}

class TestComponent extends PureComponent<FooProps> {
  propTypes = {
    foo: {
      type: Array,
      defaultValue: [],
    },
  }

  methods = {
    handlerOnTouch: () => {},
  }

  // => data
  state = {
    a: 1,
  }

  // ready
  componentDidMount() {}

  // detached
  componentWillUnmount() {}

  // 模拟
  componentDidCatch() {}

  render() {
    return (
      <view hoverClass="foo" bindtap={this.methods.handlerOnTouch}>
        <button type="2" size="3px" />
      </view>
    )
  }
}
