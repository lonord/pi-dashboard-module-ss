import {
	FullSizeWrap,
	IndicatorButton,
	LoadingText,
	Title,
	withHTTPClient
} from '@lonord/pi-dashboard-components'
import { RPCClient } from '@lonord/pi-status-rpc-client'
import {
	Dialog,
	FlexItemAdaptive,
	withFlexAlignItemsCenter,
	withFlexHorizental,
	withFlexVertical
} from '@lonord/react-electron-components'
import * as ms from 'ms'
import * as React from 'react'
import styled from 'styled-components'
import { name as displayName } from './index'
import { RunningStatus } from './types'

interface MainPropsMap {
	rpcBaseUrl: string
}

interface MainProps extends MainPropsMap {
	ssStatus: RunningStatus
	getRPCClient(): RPCClient
	fetchNow()
}

interface MainState {
	isDetailOpen: boolean
}

class Main extends React.Component<MainProps, MainState> {

	state: MainState = {
		isDetailOpen: false
	}

	openDetail = () => {
		this.setState({
			isDetailOpen: true
		})
	}

	closeDetail = () => {
		this.setState({
			isDetailOpen: false
		})
	}

	render() {
		const { isDetailOpen } = this.state
		const { ssStatus } = this.props
		return (
			<FullSizeWrap onClick={this.openDetail}>
				<Title borderColor="#2E7D32">{displayName}</Title>
				{!ssStatus
					? <LoadingText>正在连接...</LoadingText>
					: ssStatus.running
						? <div>
							<TextWrap>
								<span>服务正在运行</span>
								<SmallIndicatorButton showColor="#8BC34A" />
							</TextWrap>
							<DetailTextWrap>
								<TextSpanWrap>运行时间</TextSpanWrap>
								<GreenSpan>{ms(ssStatus.uptime)}</GreenSpan>
							</DetailTextWrap>
							<DetailTextWrap>
								<TextSpanWrap>SS模式</TextSpanWrap>
								{ssStatus.ssMode === 'auto'
									? <GreenSpan>智能模式</GreenSpan>
									: <RedSpan>全局模式</RedSpan>}
							</DetailTextWrap>
						</div>
						: <LargeTextWrap>
							<span>服务已停止</span>
							<SmallIndicatorButton showColor="#FF5722" />
						</LargeTextWrap>
				}
				{/* <Dialog isOpen={isDetailOpen} onClose={this.closeDetail} title={displayName}>
					123
				</Dialog> */}
			</FullSizeWrap>
		)
	}
}

export default withHTTPClient(Main, 'ss-status', () => ({
	action: 'getStatus'
}), 5000, 'ssStatus')

const SmallIndicatorButton = styled(IndicatorButton) `
	font-size: 10px;
`

const DetailTextWrap = styled.div`
	font-size: 12px;
	margin-top: 7px;
	padding: 0 16px;
	color: #9E9E9E;
`

const TextWrap = withFlexHorizental(withFlexAlignItemsCenter(DetailTextWrap))

const LargeTextWrap = styled(TextWrap) `
	margin-top: 30px;
`

const RedSpan = styled.span`
	color: #FF5722;
`

const GreenSpan = styled.span`
	color: #8BC34A;
`

const TextSpanWrap = styled.span`
display: inline-block;
	padding-right: 5px;
`
