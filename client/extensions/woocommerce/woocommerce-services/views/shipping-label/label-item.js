/** @format */

/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import ClipboardButton from 'components/forms/clipboard-button';
import RefundDialog from './label-refund-modal';
import ReprintDialog from './label-reprint-modal';
import DetailsDialog from './label-details-modal';
import TrackingLink from './tracking-link';
import {
	openRefundDialog,
	openReprintDialog,
	openDetailsDialog,
} from 'woocommerce/woocommerce-services/state/shipping-label/actions';
import { recordTracksEvent } from 'state/analytics/actions';

class LabelItem extends Component {
	renderRefund = label => {
		const { orderId, siteId, translate } = this.props;

		const today = new Date();
		const thirtyDaysAgo = new Date().setDate( today.getDate() - 30 );
		if (
			label.anonymized ||
			label.usedDate ||
			( label.createdDate && label.createdDate < thirtyDaysAgo )
		) {
			return null;
		}

		const openDialog = e => {
			e.preventDefault();
			this.props.openRefundDialog( orderId, siteId, label.labelId );
		};

		return (
			<span>
				<RefundDialog siteId={ siteId } orderId={ orderId } { ...label } />
				<Button onClick={ openDialog } borderless className="shipping-label__button">
					{ translate( 'Request refund' ) }
				</Button>
			</span>
		);
	};

	renderReprint = label => {
		const todayTime = new Date().getTime();
		if (
			label.anonymized ||
			label.usedDate ||
			( label.expiryDate && label.expiryDate < todayTime )
		) {
			return null;
		}

		const { orderId, siteId, translate } = this.props;

		const openDialog = e => {
			e.preventDefault();
			this.props.openReprintDialog( orderId, siteId, label.labelId );
		};

		return (
			<span>
				<ReprintDialog siteId={ siteId } orderId={ orderId } { ...label } />
				<Button onClick={ openDialog } borderless className="shipping-label__button">
					{ translate( 'Reprint' ) }
				</Button>
			</span>
		);
	};

	renderLabelDetails = label => {
		const { orderId, siteId, translate } = this.props;

		const openDialog = e => {
			e.preventDefault();
			this.props.openDetailsDialog( orderId, siteId, label.labelId );
		};

		return (
			<span>
				<DetailsDialog siteId={ siteId } orderId={ orderId } { ...label } />
				<Button onClick={ openDialog } borderless className="shipping-label__button">
					{ translate( 'View details' ) }
				</Button>
			</span>
		);
	};

	handleOnCopyClick = () => {
		this.props.recordTracksEvent( 'calypso_woocommerce_order_tracking_number_copy', {
			carrier_id: this.props.label.carrierId,
		} );
	};

	render() {
		const { label, translate } = this.props;

		return (
			<div key={ label.labelId } className="shipping-label__item">
				<p className="shipping-label__item-detail">
					<span>
						{ translate( 'Label #%(labelIndex)s printed', {
							args: {
								labelIndex: label.labelIndex + 1,
							},
						} ) }
					</span>
					{ label.showDetails && this.renderLabelDetails( label ) }
				</p>
				{ label.showDetails && (
					<React.Fragment>
						<p className="shipping-label__item-tracking">
							{ translate( 'Tracking #: {{trackingLink/}}', {
								components: {
									trackingLink: (
										<TrackingLink tracking={ label.tracking } carrierId={ label.carrierId } />
									),
								},
							} ) }
						</p>
						<ClipboardButton compact onCopy={ this.handleOnCopyClick } text={ label.tracking }>
							{ translate( 'Copy to clipboard' ) }
						</ClipboardButton>
					</React.Fragment>
				) }
				{ label.showDetails && (
					<p className="shipping-label__item-actions">
						{ this.renderRefund( label ) }
						{ this.renderReprint( label ) }
					</p>
				) }
			</div>
		);
	}
}

LabelItem.propTypes = {
	siteId: PropTypes.number.isRequired,
	orderId: PropTypes.number.isRequired,
	label: PropTypes.object.isRequired,
	openRefundDialog: PropTypes.func.isRequired,
	openReprintDialog: PropTypes.func.isRequired,
	openDetailsDialog: PropTypes.func.isRequired,
	recordTracksEvent: PropTypes.func.isRequired,
	translate: PropTypes.func.isRequired,
};

const mapDispatchToProps = dispatch => {
	return bindActionCreators(
		{
			openRefundDialog,
			openReprintDialog,
			openDetailsDialog,
			recordTracksEvent,
		},
		dispatch
	);
};

export default connect( null, mapDispatchToProps )( localize( LabelItem ) );
