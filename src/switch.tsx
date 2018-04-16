import { Button } from '@lonord/react-electron-components'
import * as React from 'react'
import styled, { StyledComponentClass } from 'styled-components'

export interface SwitchProps extends React.HTMLAttributes<HTMLSpanElement> {
	onText: string
	offText: string
	isOn: boolean
	loading: boolean
	onStatusChange(isOn: boolean)
}

interface SwitchState {
	opacity: number
}

export default class Switch extends React.Component<SwitchProps, SwitchState> {
	state: SwitchState = {
		opacity: 0.6
	}

	timer: any = null

	reverseOpacity = () => {
		this.setState({
			opacity: this.state.opacity === 0.2 ? 0.6 : 0.2
		})
	}

	startFlash = () => {
		this.timer = setInterval(this.reverseOpacity, 300)
	}

	stopFlash = () => {
		clearInterval(this.timer)
	}

	onClick = () => {
		const { loading, onStatusChange } = this.props
		if (loading) {
			return
		}
		onStatusChange(true)
	}

	offClick = () => {
		const { loading, onStatusChange } = this.props
		if (loading) {
			return
		}
		onStatusChange(false)
	}

	componentDidUpdate(prevProps: SwitchProps) {
		if (prevProps.loading) {
			this.stopFlash()
		}
		if (this.props.loading) {
			this.startFlash()
		}
	}

	componentDidMount() {
		if (this.props.loading) {
			this.startFlash()
		}
	}

	componentWillUnmount() {
		this.stopFlash()
	}

	render() {
		const { onText, offText, isOn, loading, onStatusChange, ...rest } = this.props
		const OnButton = isOn ? GreenButton : CommonButton
		const OffButton = !isOn ? RedButton : CommonButton
		return (
			<Wrap {...rest} opacity={loading ? this.state.opacity : 1}>
				<OnButton onClick={this.onClick}>{onText}</OnButton>
				<SepWrap>|</SepWrap>
				<OffButton onClick={this.offClick}>{offText}</OffButton>
			</Wrap>
		)
	}
}

interface WrapProps extends React.HTMLAttributes<HTMLSpanElement> {
	opacity: number
}
const RawWrap = styled.span`
	display: inline-block;
	transition: opacity 0.2s;
	color: #9E9E9E;
`
const Wrap = styled(RawWrap as any as React.ComponentType<WrapProps>) `
	opacity: ${props => props.opacity};
`

const SepWrap = styled.span`
	color: #f0f0f0;
`

const SwitchButton = styled(Button) `
	font-size: 14px;
`

const CommonButton = styled(SwitchButton) `
	color: #ccc;
`

const GreenButton = styled(SwitchButton) `
	color: #8BC34A;
`

const RedButton = styled(SwitchButton) `
	color: #FF5722;
`
