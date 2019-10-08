import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { AppState, View } from 'react-native';
import * as RNLocalize from 'react-native-localize';
import VersionNumber from 'react-native-version-number';

import { setI18nConfig } from 'App/Helpers/I18n';
import AppStateActions from 'App/Stores/AppState/Actions';

const EVENTS = {
  CHANGE: 'change',
};

// kick off i18n env.
setI18nConfig();

class AppMonitor extends React.Component {
  static propTypes = {
    children: PropTypes.any.isRequired,
    handleAppStateUpdate: PropTypes.func.isRequired,
    handleAppLocaleUpdate: PropTypes.func.isRequired,
    handleAppVersionUpdate: PropTypes.func.isRequired,
  };

  /**
   * Define default event states
   */
  constructor(props) {
    super(props);
    this.state = {
      currentState: AppState.currentState,
    };
  }

  /**
   * Register your event listeners when the app is mounted
   */
  componentDidMount() {
    // Update app version when starts
    const { handleAppVersionUpdate } = this.props;
    handleAppVersionUpdate(VersionNumber);

    // kick off the state updates
    this.onAppStateChange();
    this.onLocalizationChange();

    // AppState change event listener
    AppState.addEventListener(EVENTS.CHANGE, this.onAppStateChange);

    // Locale change event listener
    RNLocalize.addEventListener(EVENTS.CHANGE, this.onLocalizationChange);
  }

  /**
   * You must unregister listeners when your component unmount
   */
  componentWillUnmount() {
    // AppState change event listener
    AppState.removeEventListener(EVENTS.CHANGE, this.onAppStateChange);

    // Locale change event listener
    RNLocalize.addEventListener(EVENTS.CHANGE, this.onLocalizationChange);
  }

  /**
   * Handle app state changes
   * @see https://facebook.github.io/react-native/docs/appstate
   * @memberof AppMonitor
   */
  onAppStateChange = (nextAppState) => {
    __DEV__ && console.log('@onAppStateChange: ', nextAppState);

    // update appState when changes
    this.setState({ currentState: nextAppState }, () => {
      const { handleAppStateUpdate } = this.props;
      handleAppStateUpdate(nextAppState);
    });
  };

  /**
   * Handle app locale changes
   * @see https://github.com/react-native-community/react-native-localize
   * @memberof AppMonitor
   */
  onLocalizationChange = () => {
    const { handleAppLocaleUpdate } = this.props;
    handleAppLocaleUpdate({
      currentLocales: RNLocalize.getLocales(),
      currentTimeZone: RNLocalize.getTimeZone(),
    });

    // Update app locale
    setI18nConfig();

    // Force re-render
    this.forceUpdate();
  };

  render() {
    const { children } = this.props;
    const { currentState } = this.state;
    return children(currentState);
  }
}

export default connect(
  (state) => ({}),
  (dispatch) =>
    bindActionCreators(
      {
        handleAppStateUpdate: AppStateActions.onStateChange,
        handleAppLocaleUpdate: AppStateActions.onLocaleChange,
        handleAppVersionUpdate: AppStateActions.onVersionChange,
      },
      dispatch,
    ),
)(AppMonitor);
