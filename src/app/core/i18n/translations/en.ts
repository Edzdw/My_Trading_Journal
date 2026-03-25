import { TranslationDictionary } from '../i18n.models';

export const enTranslations: TranslationDictionary = {
  common: {
    appName: 'Trade Journal',
    language: 'Language',
    themes: {
      light: 'Light',
      dark: 'Dark',
      lightMode: 'Light mode',
      darkMode: 'Dark mode'
    },
    actions: {
      create: 'Create',
      edit: 'Edit',
      delete: 'Delete',
      logout: 'Log out',
      back: 'Back',
      backToTrades: 'Back to Trades',
      openProtectedPage: 'Open protected page'
    },
    states: {
      loading: 'Loading...',
      notAvailable: 'N/A'
    }
  },
  auth: {
    shell: {
      headline: 'Build disciplined trading habits with a cleaner workflow.',
      description:
        'Start with authentication first. Portfolio, trades, and journal features can plug into this foundation later without reshaping the app.',
      currentFocusLabel: 'Current focus',
      currentFocusDescription:
        'Simple auth pages, local token persistence, and a clean feature-based Angular structure.',
      tabs: {
        login: 'Sign in',
        register: 'Create account'
      }
    },
    login: {
      title: 'Welcome back',
      subtitle: 'Sign in to continue to the protected trade journal area.',
      email: 'Email',
      password: 'Password',
      passwordPlaceholder: 'Enter your password',
      submit: 'Sign in',
      submitting: 'Signing in...',
      noAccount: 'No account yet?',
      createOne: 'Create one here',
      existingSession: 'Existing session detected.',
      fallbackError: 'Unable to sign in with the provided credentials.'
    },
    register: {
      title: 'Create your account',
      subtitle: 'Register once, store the issued tokens, and continue into the protected area.',
      email: 'Email',
      password: 'Password',
      passwordPlaceholder: 'Create a password',
      submit: 'Create account',
      submitting: 'Creating account...',
      existingAccount: 'Already have an account?',
      signInHere: 'Sign in here',
      fallbackError: 'Unable to create your account right now.'
    },
    protected: {
      title: 'Protected App',
      subtitle: 'Phase 1 includes auth and trade management foundations.',
      signedInAs: 'Signed in as',
      currentUser: 'Current user',
      logoutSubmitting: 'Signing out...',
      logoutError: 'Unable to sign out right now.',
      nav: {
        trades: 'View',
        newTrade: 'Create'
      }
    }
  },
  trade: {
    nav: {
      trades: 'Trades'
    },
    range: {
      '1D': '1D',
      '7D': '7D',
      '30D': '30D'
    },
    dashboard: {
      title: 'Trades Dashboard',
      subtitle: 'Performance Overview',
      description:
        "Analytics are derived from the currently loaded trade list and filtered by each trade's open time.",
      cards: {
        totalTrades: 'Total Trades',
        openTrades: 'Open Trades',
        closedTrades: 'Closed Trades',
        mostTraded: 'Most Traded',
        estimatedPnl: 'Estimated P&L',
        pnlNote: 'Based on {count} trade(s) with entry, exit, and quantity data.'
      },
      charts: {
        tradesOverTime: 'Trades Over Time',
        tradesOverTimeDescription: 'Simple frontend view of trade count by day.',
        symbolDistribution: 'Symbol Distribution',
        symbolDistributionDescription: 'Most active symbols in the selected range.',
        sideDistribution: 'Side Distribution',
        sideDistributionDescription: 'BUY and SELL mix for filtered trades.',
        noSymbolData: 'No symbol data for this range.',
        noSideData: 'No side data for this range.'
      }
    },
    list: {
      title: 'Trade List',
      description: 'Formatted for readability while preserving API string values internally.',
      createTrade: 'Create Trade',
      loading: 'Loading trades...',
      emptyTitle: 'No trades yet',
      emptyDescription: 'Create your first trade entry to start building the journal.',
      deleteSubmitting: 'Deleting...',
      deleteConfirm: 'Delete trade #{tradeNo} for {symbol}?',
      deleteError: 'Unable to delete the trade right now.',
      loadError: 'Unable to load trades right now.',
      fields: {
        tradeNo: 'Trade No',
        symbol: 'Symbol',
        sideStatus: 'Side / Status',
        entryQuantity: 'Entry / Quantity',
        openTime: 'Open Time',
        riskLevels: 'Risk Levels',
        exit: 'Exit',
        lastUpdated: 'Last Updated',
        thesis: 'Thesis',
        note: 'Note',
        qty: 'Qty',
        stillOpen: 'Still open / not set'
      },
      status: {
        open: 'Open',
        closed: 'Closed'
      },
      side: {
        buy: 'Buy',
        sell: 'Sell'
      }
    },
    form: {
      fields: {
        symbol: 'Symbol',
        marketType: 'Market Type',
        side: 'Side',
        openTime: 'Open Time',
        entryPrice: 'Entry Price',
        stopLoss: 'Stop Loss',
        takeProfit: 'Take Profit',
        quantity: 'Quantity',
        thesis: 'Thesis',
        note: 'Note'
      },
      placeholders: {
        thesis: 'Breakout above resistance with volume confirmation',
        note: 'Updated take profit after momentum confirmation'
      },
      marketType: {
        crypto: 'Crypto',
        forex: 'Forex',
        stock: 'Stock',
        futures: 'Futures'
      },
      side: {
        buy: 'Buy',
        sell: 'Sell'
      }
    },
    create: {
      title: 'Create Trade',
      description:
        'Capture a new trade using the current phase-1 fields. Values are preserved as strings for API compatibility.',
      submit: 'Save Trade',
      submitting: 'Saving trade...',
      error: 'Unable to create the trade right now.'
    },
    edit: {
      title: 'Edit Trade',
      description: 'Update the current phase-1 trade fields and submit a PATCH request to the backend.',
      loading: 'Loading trade...',
      submit: 'Update Trade',
      submitting: 'Updating trade...',
      missingId: 'Trade id is missing.',
      loadError: 'Unable to load the selected trade.',
      error: 'Unable to update the trade right now.'
    }
  }
};
