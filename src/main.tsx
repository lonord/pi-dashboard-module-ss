import {
	FullSizeWrap,
	IndicatorButton,
	LoadingText,
	Title,
	withHTTPClient
} from '@lonord/pi-dashboard-components'
import { RPCClient } from '@lonord/pi-status-rpc-client'
import {
	Button,
	Dialog,
	FlexItemAdaptive,
	withFlexAlignItemsCenter,
	withFlexHorizental,
	withFlexVertical
} from '@lonord/react-electron-components'
import * as _ from 'lodash'
import * as ms from 'ms'
import * as prettyBytes from 'pretty-bytes'
import * as React from 'react'
import styled from 'styled-components'
import { name as displayName } from './index'
import Switch from './switch'
import { RunningStatus } from './types'

interface MainPropsMap {
	rpcBaseUrl: string
}

interface MainProps extends MainPropsMap {
	ssStatus: RunningStatus
	getRPCClient(): RPCClient
	fetchNow(fn?: () => void)
}

interface MainState {
	isDetailOpen: boolean
	isRunningChanging: boolean
	isSSModeChanging: boolean
	isGfwlistUpdating: boolean
}

class Main extends React.Component<MainProps, MainState> {

	state: MainState = {
		isDetailOpen: false,
		isRunningChanging: false,
		isSSModeChanging: false,
		isGfwlistUpdating: false
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

	postAction = (data: any, fn: () => void) => {
		const { ssStatus, getRPCClient, fetchNow } = this.props
		const rpcClient = getRPCClient()
		if (rpcClient) {
			rpcClient.httpPost('ss-status', data).catch(() => null).then(() => fetchNow(fn))
		} else {
			setTimeout(fn, 1)
		}
	}

	onRunningChange = (isRun) => {
		const { ssStatus } = this.props
		if (ssStatus) {
			if (isRun && !ssStatus.running) {
				this.setState({
					isRunningChanging: true
				})
				this.postAction({ action: 'start' }, () => {
					this.setState({
						isRunningChanging: false
					})
				})
			}
			if (!isRun && ssStatus.running) {
				this.setState({
					isRunningChanging: true
				})
				this.postAction({ action: 'stop' }, () => {
					this.setState({
						isRunningChanging: false
					})
				})
			}
		}
	}

	onSSModeChange = (isAuto) => {
		const { ssStatus } = this.props
		if (ssStatus) {
			if (isAuto && ssStatus.ssMode !== 'auto') {
				this.setState({
					isSSModeChanging: true
				})
				this.postAction({ action: 'setSSMode', mode: 'auto' }, () => {
					this.setState({
						isSSModeChanging: false
					})
				})
			}
			if (!isAuto && ssStatus.ssMode === 'auto') {
				this.setState({
					isSSModeChanging: true
				})
				this.postAction({ action: 'setSSMode', mode: 'global' }, () => {
					this.setState({
						isSSModeChanging: false
					})
				})
			}
		}
	}

	updateGfwlist = () => {
		const { ssStatus } = this.props
		if (ssStatus) {
			this.setState({
				isGfwlistUpdating: true
			})
			this.postAction({ action: 'updateStandardGFWList' }, () => {
				this.setState({
					isGfwlistUpdating: false
				})
			})
		}
	}

	render() {
		const { isDetailOpen, isRunningChanging, isSSModeChanging, isGfwlistUpdating } = this.state
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
								<TextSpanWrap>代理模式</TextSpanWrap>
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
				<Dialog isOpen={isDetailOpen} onClose={this.closeDetail} title={displayName}>
					{!ssStatus
						? <LoadingText>正在连接...</LoadingText>
						: <div>
							<DetailTextWrap>
								<ProcessNameText>运行状态</ProcessNameText>
								<Switch onText="运行" offText="停止"
									loading={isRunningChanging}
									isOn={ssStatus.running}
									onStatusChange={this.onRunningChange} />
							</DetailTextWrap>
							<DetailTextWrap>
								<ProcessNameText>代理模式</ProcessNameText>
								<Switch onText="智能" offText="全局"
									loading={isSSModeChanging}
									isOn={ssStatus.ssMode === 'auto'}
									onStatusChange={this.onSSModeChange} />
							</DetailTextWrap>
							<DetailTextWrap>
								<ProcessNameText>gfwlist</ProcessNameText>
								{isGfwlistUpdating
									? <UpdatingText>正在更新...</UpdatingText>
									: <ActionButton onClick={this.updateGfwlist}>更新</ActionButton>}
							</DetailTextWrap>
							<ProcessInfoWrap>
								{ssStatus.running && _.map(ssStatus.processStatus, (val, key) => (
									<DetailTextWrap key={key}>
										<ProcessNameText>{key}</ProcessNameText>
										<span>cpu&nbsp;</span>
										<CPUSpan>{`${val.cpu}%`}</CPUSpan>
										<SepSpan>|</SepSpan>
										<span>mem&nbsp;</span>
										<ValueSpan>{prettyBytes(val.mem)}</ValueSpan>
									</DetailTextWrap>
								))}
							</ProcessInfoWrap>
						</div>
					}
				</Dialog>
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

const StatusNameText = styled.span`
	display: inline-block;
	width: 60px;
`

const ProcessInfoWrap = styled.div`
	margin-top: 10px;
	margin-bottom: 15px;
`

const ProcessNameText = styled.span`
	display: inline-block;
	width: 105px;
	text-align: right;
	padding-right: 10px;
	font-weight: bold;
`

const SepSpan = styled.span`
	display: inline-block;
	color: #f0f0f0;
	padding: 0 8px;
`

const ValueSpan = styled.span`
	font-weight: bold;
`

const CPUSpan = styled(ValueSpan) `
	display: inline-block;
	width: 32px;
	text-align: center;
`

const ActionButton = styled(Button) `
	font-size: 14px;
	color: #8BC34A;
`

const UpdatingText = styled.span`
	display: inline-block;
	padding: 5px;
	font-size: 12px;
	color: #e0e0e0;
`
