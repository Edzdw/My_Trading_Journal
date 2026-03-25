import { TranslationDictionary } from '../i18n.models';

export const viTranslations: TranslationDictionary = {
  common: {
    appName: 'Nhat ky giao dich',
    language: 'Ngon ngu',
    themes: {
      light: 'Sang',
      dark: 'Toi',
      lightMode: 'Che do sang',
      darkMode: 'Che do toi'
    },
    actions: {
      create: 'Tao',
      edit: 'Sua',
      delete: 'Xoa',
      logout: 'Dang xuat',
      back: 'Quay lai',
      backToTrades: 'Quay lai danh sach lenh',
      openProtectedPage: 'Mo trang bao ve'
    },
    states: {
      loading: 'Dang tai...',
      notAvailable: 'Khong co'
    }
  },
  auth: {
    shell: {
      headline: 'Xay dung thoi quen giao dich ky luat voi quy trinh gon gang hon.',
      description:
        'Bat dau tu xac thuc. Cac tinh nang danh muc, lenh giao dich va nhat ky co the gan vao nen tang nay sau ma khong can doi cau truc ung dung.',
      currentFocusLabel: 'Trong tam hien tai',
      currentFocusDescription:
        'Trang dang nhap don gian, luu token tren trinh duyet va cau truc Angular theo tung tinh nang.',
      tabs: {
        login: 'Dang nhap',
        register: 'Tao tai khoan'
      }
    },
    login: {
      title: 'Chao mung quay lai',
      subtitle: 'Dang nhap de tiep tuc vao khu vuc nhat ky giao dich duoc bao ve.',
      email: 'Email',
      password: 'Mat khau',
      passwordPlaceholder: 'Nhap mat khau cua ban',
      submit: 'Dang nhap',
      submitting: 'Dang dang nhap...',
      noAccount: 'Chua co tai khoan?',
      createOne: 'Tao tai khoan tai day',
      existingSession: 'Da phat hien phien dang nhap hien co.',
      fallbackError: 'Khong the dang nhap voi thong tin da cung cap.'
    },
    register: {
      title: 'Tao tai khoan cua ban',
      subtitle: 'Dang ky mot lan, luu token duoc cap va tiep tuc vao khu vuc bao ve.',
      email: 'Email',
      password: 'Mat khau',
      passwordPlaceholder: 'Tao mat khau',
      submit: 'Tao tai khoan',
      submitting: 'Dang tao tai khoan...',
      existingAccount: 'Da co tai khoan?',
      signInHere: 'Dang nhap tai day',
      fallbackError: 'Khong the tao tai khoan luc nay.'
    },
    protected: {
      title: 'Ung dung bao ve',
      subtitle: 'Giai doan 1 bao gom nen tang xac thuc va quan ly giao dich.',
      signedInAs: 'Dang nhap voi',
      currentUser: 'Nguoi dung hien tai',
      logoutSubmitting: 'Dang dang xuat...',
      logoutError: 'Khong the dang xuat luc nay.',
      nav: {
        trades: 'Lenh giao dich',
        newTrade: 'Lenh moi'
      }
    }
  },
  trade: {
    nav: {
      trades: 'Lenh giao dich'
    },
    range: {
      '1D': '1N',
      '7D': '7N',
      '30D': '30N'
    },
    dashboard: {
      title: 'Bang dieu khien giao dich',
      subtitle: 'Tong quan hieu suat',
      description:
        'So lieu duoc tinh tu danh sach lenh hien tai va loc theo thoi gian mo cua tung lenh.',
      cards: {
        totalTrades: 'Tong so lenh',
        openTrades: 'Lenh dang mo',
        closedTrades: 'Lenh da dong',
        mostTraded: 'Giao dich nhieu nhat',
        estimatedPnl: 'Lai lo uoc tinh',
        pnlNote: 'Duoc tinh tu {count} lenh co du gia vao, gia ra va khoi luong.'
      },
      charts: {
        tradesOverTime: 'Lenh theo thoi gian',
        tradesOverTimeDescription: 'Goc nhin frontend don gian ve so lenh theo ngay.',
        symbolDistribution: 'Phan bo ma',
        symbolDistributionDescription: 'Nhung ma giao dich nhieu nhat trong khoang da chon.',
        sideDistribution: 'Phan bo chieu lenh',
        sideDistributionDescription: 'Ty le mua va ban trong cac lenh da loc.',
        noSymbolData: 'Khong co du lieu ma cho khoang nay.',
        noSideData: 'Khong co du lieu chieu lenh cho khoang nay.'
      }
    },
    list: {
      title: 'Danh sach lenh',
      description: 'Dinh dang de de doc trong khi van giu gia tri chuoi tu API.',
      createTrade: 'Tao lenh',
      loading: 'Dang tai lenh...',
      emptyTitle: 'Chua co lenh nao',
      emptyDescription: 'Tao lenh dau tien de bat dau xay dung nhat ky.',
      deleteSubmitting: 'Dang xoa...',
      deleteConfirm: 'Xoa lenh #{tradeNo} cua {symbol}?',
      deleteError: 'Khong the xoa lenh luc nay.',
      loadError: 'Khong the tai danh sach lenh luc nay.',
      fields: {
        tradeNo: 'So lenh',
        symbol: 'Ma',
        sideStatus: 'Chieu / Trang thai',
        entryQuantity: 'Gia vao / Khoi luong',
        openTime: 'Thoi gian mo',
        riskLevels: 'Muc rui ro',
        exit: 'Gia ra',
        lastUpdated: 'Cap nhat lan cuoi',
        thesis: 'Luan diem',
        note: 'Ghi chu',
        qty: 'KL',
        stillOpen: 'Van dang mo / chua dat'
      },
      status: {
        open: 'Dang mo',
        closed: 'Da dong'
      },
      side: {
        buy: 'Mua',
        sell: 'Ban'
      }
    },
    form: {
      fields: {
        symbol: 'Ma',
        marketType: 'Loai thi truong',
        side: 'Chieu lenh',
        openTime: 'Thoi gian mo',
        entryPrice: 'Gia vao',
        stopLoss: 'Cat lo',
        takeProfit: 'Chot loi',
        quantity: 'Khoi luong',
        thesis: 'Luan diem',
        note: 'Ghi chu'
      },
      placeholders: {
        thesis: 'Pha vo vung khang cu kem xac nhan khoi luong',
        note: 'Da dieu chinh muc chot loi sau khi dong luong duoc xac nhan'
      },
      marketType: {
        crypto: 'Tien dien tu',
        forex: 'Ngoai hoi',
        stock: 'Co phieu',
        futures: 'Phai sinh'
      },
      side: {
        buy: 'Mua',
        sell: 'Ban'
      }
    },
    create: {
      title: 'Tao lenh',
      description:
        'Ghi lai mot lenh moi bang cac truong giai doan 1 hien tai. Gia tri duoc giu dang chuoi de tuong thich API.',
      submit: 'Luu lenh',
      submitting: 'Dang luu lenh...',
      error: 'Khong the tao lenh luc nay.'
    },
    edit: {
      title: 'Sua lenh',
      description: 'Cap nhat cac truong giao dich giai doan 1 va gui yeu cau PATCH toi backend.',
      loading: 'Dang tai lenh...',
      submit: 'Cap nhat lenh',
      submitting: 'Dang cap nhat lenh...',
      missingId: 'Thieu trade id.',
      loadError: 'Khong the tai lenh da chon.',
      error: 'Khong the cap nhat lenh luc nay.'
    }
  }
};
