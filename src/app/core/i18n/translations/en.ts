import { TranslationDictionary } from '../i18n.models';

export const enTranslations: TranslationDictionary = {
  journal: {
    "title": "Trading journal",
    "subtitle": "Review closed trades and update your notes.",
    "today": "Today",
    "date": "Trading day",
    "previousDay": "Previous day",
    "nextDay": "Next day",
    "summary": "{total} closed trades · {missing} without notes",
    "loading": "Loading trades…",
    "unavailable": "Data unavailable",
    "dayTrades": "Trades for the day",
    "noteFilter": "Filter by notes",
    "all": "All",
    "withoutNote": "No notes yet",
    "hasNote": "Has notes",
    "closedAt": "Closed",
    "closed": "Closed",
    "manual": "Manual",
    "pagination": "Page {page}/{pages} · {total} trades",
    "previousPage": "Previous page",
    "nextPage": "Next page",
    "entryExit": "Entry → Exit",
    "quantity": "Quantity",
    "holdingTime": "Holding time",
    "openTime": "Opened",
    "closeTime": "Closed",
    "tradeNote": "Trade notes",
    "dailySummary": "Daily summary",
    "comingSoon": "Coming soon",
    "thesis": "Entry thesis",
    "note": "Post-trade notes",
    "thesisPlaceholder": "Why did you enter this trade?",
    "notePlaceholder": "What happened, decisions to revisit, lessons for next time…",
    "good": "What went well",
    "improve": "What to improve",
    "save": "Save notes",
    "saveNext": "Save & next trade",
    "nextTrade": "Next trade",
    "saving": "Saving…",
    "unsaved": "Unsaved changes",
    "upToDate": "Up to date",
    "executionUnchanged": "Execution details stay unchanged.",
    "selectTrade": "Select a trade to write your journal",
    "selectTradeHelp": "Choose a closed trade to see its details and update your notes.",
    "noTrades": "No trades closed on this day",
    "noTradesHelp": "Choose another date or import an MT5 report. Trades are grouped by closing date, not import date.",
    "noMissing": "All trades for this day have notes",
    "noMissingHelp": "Choose “All” to read or edit your notes.",
    "import": "Import an MT5 report",
    "loadError": "Could not load trades. Please try again.",
    "saveError": "Your notes could not be saved. Your draft is still here; please try saving again.",
    "retry": "Try again",
    "saved": "Notes saved.",
    "lastTrade": "You are at the last trade in the current list.",
    "discard": "You have unsaved changes. Discard them to continue?",
    "lessMinute": "Under 1 minute",
    "dayUnit": "d",
    "hourUnit": "h",
    "minuteUnit": "m"
},
  importTask: {
    "uploading": "Uploading MT5 report",
    "analysing": "Analysing report",
    "importing": "Importing trades",
    "ready": "Preview ready for review",
    "complete": "Trade import complete",
    "error": "Request could not be completed",
    "interrupted": "Preview interrupted",
    "unknown": "Import result unconfirmed",
    "idle": "No active task",
    "oneFile": "1 file",
    "keepBrowsing": "You can browse other pages in the app. Keep this browser tab open to follow the result.",
    "unknownHelp": "No confirmation was received. The import may have completed or may still be running, including in another tab. Check trade history before importing again.",
    "interruptedHelp": "The preview could not be restored. Select the file again to preview it; the report is never resent automatically.",
    "resetHelp": "Only start again after checking history. Resetting does not cancel a request already sent to the server.",
    "reset": "Reset / Choose a new file",
    "view": "View import",
    "history": "Trade history",
    "result": "Imported {imported} trades · Skipped {skipped} trades",
    "noRows": "The report has no valid trades to import.",
    "sessionRequired": "Your account is still loading. Please try again shortly."
},
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
        trades: 'Trades',
        newTrade: 'New Trade',
        importTrades: 'Import Trades'
      }
    }
  },
  trade: {
    nav: {
      trades: 'Trades',
      importTrades: 'Import Trades'
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
    },
    import: {
      title: 'Import Trades',
      description:
        'Upload an MT5 HTML report, inspect the parsed preview, then confirm the import with the backend.',
      sourceNote: 'Phase-1 import uses backend preview and confirm endpoints with no frontend-side parsing.',
      uploadLabel: 'MT5 HTML report file',
      uploadHelp: 'Select one .html or .htm report exported from MT5.',
      selectedFile: 'Selected file',
      noFileSelected: 'No file selected yet.',
      preview: 'Preview Import',
      previewing: 'Previewing...',
      confirm: 'Confirm Import',
      confirming: 'Importing...',
      reset: 'Clear',
      previewRequired: 'Preview the selected file successfully before confirming import.',
      previewSuccess: 'Preview loaded successfully. Review the parsed rows before confirming.',
      confirmSuccess: 'Import completed successfully.',
      errorsTitle: 'Errors',
      warningsTitle: 'Warnings',
      requestError: 'Unable to process the import request right now.',
      metadata: {
        title: 'Preview Metadata',
        originalFilename: 'Original filename',
        accountNo: 'Account No',
        accountName: 'Account Name',
        brokerName: 'Broker Name',
        brokerServer: 'Broker Server',
        reportDate: 'Report Date',
        totalRows: 'Total Rows',
        parsedRows: 'Parsed Rows',
        skippedRows: 'Skipped Rows'
      },
      previewTable: {
        title: 'Preview Trades',
        description: 'These rows come from the backend parser and have not been saved yet.',
        empty: 'No preview trade rows were returned.',
        fields: {
          externalPositionId: 'External Position ID',
          externalOrderId: 'External Order ID',
          symbol: 'Symbol',
          side: 'Side',
          quantity: 'Quantity',
          entryPrice: 'Entry Price',
          stopLoss: 'Stop Loss',
          takeProfit: 'Take Profit',
          openTime: 'Open Time',
          exitPrice: 'Exit Price',
          closeTime: 'Close Time',
          commission: 'Commission',
          swap: 'Swap',
          fee: 'Fee',
          profit: 'Profit',
          closeReason: 'Close Reason',
          rawComment: 'Raw Comment'
        }
      },
      confirmSummary: {
        title: 'Import Summary',
        importBatchId: 'Import Batch ID',
        totalRows: 'Total Rows',
        importedRows: 'Imported Rows',
        skippedRows: 'Skipped Rows'
      },
      closeReason: {
        tp: 'Take Profit',
        sl: 'Stop Loss',
        unknown: 'Unknown'
      }
    }
  }
};
