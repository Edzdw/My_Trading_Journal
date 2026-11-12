import { TranslationDictionary } from '../i18n.models';

export const viTranslations: TranslationDictionary = {
  journal: {
    "title": "Nhật ký giao dịch",
    "subtitle": "Xem lại các lệnh đã đóng và cập nhật ghi chú.",
    "today": "Hôm nay",
    "date": "Ngày giao dịch",
    "previousDay": "Ngày trước",
    "nextDay": "Ngày tiếp theo",
    "summary": "{total} lệnh đã đóng · {missing} lệnh chưa có ghi chú",
    "loading": "Đang tải giao dịch…",
    "unavailable": "Chưa tải được dữ liệu",
    "dayTrades": "Giao dịch trong ngày",
    "noteFilter": "Lọc theo ghi chú",
    "all": "Tất cả",
    "withoutNote": "Chưa có ghi chú",
    "hasNote": "Có ghi chú",
    "closedAt": "Đóng",
    "closed": "Đã đóng",
    "manual": "Thủ công",
    "pagination": "Trang {page}/{pages} · {total} lệnh",
    "previousPage": "Trang trước",
    "nextPage": "Trang tiếp theo",
    "entryExit": "Entry → Exit",
    "quantity": "Khối lượng",
    "holdingTime": "Thời gian giữ",
    "openTime": "Thời gian mở",
    "closeTime": "Thời gian đóng",
    "tradeNote": "Ghi chú lệnh",
    "dailySummary": "Tổng kết ngày",
    "comingSoon": "Sắp có",
    "thesis": "Lý do vào lệnh",
    "note": "Ghi chú sau giao dịch",
    "thesisPlaceholder": "Lý do bạn quyết định vào lệnh này…",
    "notePlaceholder": "Điều đã diễn ra, quyết định muốn xem lại, bài học cho lần sau…",
    "good": "Điều làm tốt",
    "improve": "Điều cần cải thiện",
    "save": "Lưu ghi chú",
    "saveNext": "Lưu & lệnh tiếp theo",
    "nextTrade": "Lệnh tiếp theo",
    "saving": "Đang lưu…",
    "unsaved": "Chưa lưu thay đổi",
    "upToDate": "Đã cập nhật",
    "executionUnchanged": "Thông tin khớp lệnh được giữ nguyên.",
    "selectTrade": "Chọn giao dịch để viết nhật ký",
    "selectTradeHelp": "Chọn một lệnh đã đóng trong danh sách để xem chi tiết và cập nhật ghi chú.",
    "noTrades": "Chưa có lệnh đóng trong ngày này",
    "noTradesHelp": "Chọn ngày khác hoặc import báo cáo MT5. Giao dịch được nhóm theo ngày đóng, không phải ngày import.",
    "noMissing": "Các lệnh trong ngày đều có ghi chú",
    "noMissingHelp": "Chọn “Tất cả” để xem hoặc chỉnh sửa nội dung đã viết.",
    "import": "Import báo cáo MT5",
    "loadError": "Không tải được giao dịch. Vui lòng thử lại.",
    "saveError": "Chưa lưu được ghi chú. Nội dung bạn đang viết vẫn được giữ lại; vui lòng thử lưu lại.",
    "retry": "Thử lại",
    "saved": "Đã lưu ghi chú.",
    "lastTrade": "Bạn đang ở lệnh cuối trong danh sách hiện tại.",
    "discard": "Bạn có thay đổi chưa lưu. Bỏ những thay đổi này để tiếp tục?",
    "lessMinute": "Dưới 1 phút",
    "dayUnit": " ngày",
    "hourUnit": " giờ",
    "minuteUnit": " phút"
},
  importTask: {
    "uploading": "Đang gửi báo cáo MT5",
    "analysing": "Đang phân tích báo cáo",
    "importing": "Đang nhập giao dịch",
    "ready": "Bản xem trước đã sẵn sàng",
    "complete": "Nhập giao dịch hoàn tất",
    "error": "Không thể hoàn tất yêu cầu",
    "interrupted": "Lượt xem trước bị gián đoạn",
    "unknown": "Chưa xác định kết quả nhập",
    "idle": "Chưa có tác vụ",
    "oneFile": "1 file",
    "keepBrowsing": "Bạn có thể chuyển trang trong ứng dụng. Giữ tab trình duyệt này mở để theo dõi kết quả.",
    "unknownHelp": "Chưa nhận được kết quả xác nhận. Lượt nhập có thể đã hoàn tất hoặc vẫn đang chạy, kể cả trong tab khác. Kiểm tra lịch sử giao dịch trước khi nhập lại.",
    "interruptedHelp": "Không khôi phục được lượt xem trước. Hãy chọn lại file để xem trước; ứng dụng không tự gửi lại báo cáo.",
    "resetHelp": "Chỉ bắt đầu lượt mới sau khi kiểm tra lịch sử. Đặt lại không hủy tác vụ đã gửi tới máy chủ.",
    "reset": "Đặt lại / Chọn file mới",
    "view": "Xem import",
    "history": "Lịch sử giao dịch",
    "result": "Đã nhập {imported} lệnh · Bỏ qua {skipped} lệnh",
    "noRows": "Báo cáo không có giao dịch hợp lệ để nhập.",
    "sessionRequired": "Đang tải thông tin tài khoản. Vui lòng thử lại sau giây lát."
},
  common: {
    appName: 'Nhật ký giao dịch',
    language: 'Ngôn ngữ',
    themes: {
      light: 'Sáng',
      dark: 'Tối',
      lightMode: 'Chế độ sáng',
      darkMode: 'Chế độ tối'
    },
    actions: {
      create: 'Tạo',
      edit: 'Sửa',
      delete: 'Xóa',
      logout: 'Đăng xuất',
      back: 'Quay lại',
      backToTrades: 'Quay lại danh sách lệnh',
      openProtectedPage: 'Mở trang bảo vệ'
    },
    states: {
      loading: 'Đang tải...',
      notAvailable: 'Không có'
    }
  },

  auth: {
    shell: {
      headline: 'Xây dựng thói quen giao dịch kỷ luật với quy trình gọn gàng hơn.',
      description:
        'Bắt đầu từ xác thực. Các tính năng danh mục, lệnh giao dịch và nhật ký có thể được tích hợp vào nền tảng này mà không cần thay đổi cấu trúc ứng dụng.',
      currentFocusLabel: 'Trọng tâm hiện tại',
      currentFocusDescription:
        'Trang đăng nhập đơn giản, lưu token trên trình duyệt và cấu trúc Angular theo từng tính năng.',
      tabs: {
        login: 'Đăng nhập',
        register: 'Tạo tài khoản'
      }
    },

    login: {
      title: 'Chào mừng quay lại',
      subtitle: 'Đăng nhập để tiếp tục vào khu vực nhật ký giao dịch được bảo vệ.',
      email: 'Email',
      password: 'Mật khẩu',
      passwordPlaceholder: 'Nhập mật khẩu của bạn',
      submit: 'Đăng nhập',
      submitting: 'Đang đăng nhập...',
      noAccount: 'Chưa có tài khoản?',
      createOne: 'Tạo tài khoản tại đây',
      existingSession: 'Đã phát hiện phiên đăng nhập hiện có.',
      fallbackError: 'Không thể đăng nhập với thông tin đã cung cấp.'
    },

    register: {
      title: 'Tạo tài khoản của bạn',
      subtitle: 'Đăng ký một lần, lưu token và tiếp tục vào khu vực bảo vệ.',
      email: 'Email',
      password: 'Mật khẩu',
      passwordPlaceholder: 'Tạo mật khẩu',
      submit: 'Tạo tài khoản',
      submitting: 'Đang tạo tài khoản...',
      existingAccount: 'Đã có tài khoản?',
      signInHere: 'Đăng nhập tại đây',
      fallbackError: 'Không thể tạo tài khoản lúc này.'
    },

    protected: {
      title: 'Ứng dụng bảo vệ',
      subtitle: 'Giai đoạn 1 bao gồm xác thực và quản lý giao dịch.',
      signedInAs: 'Đăng nhập với',
      currentUser: 'Người dùng hiện tại',
      logoutSubmitting: 'Đang đăng xuất...',
      logoutError: 'Không thể đăng xuất lúc này.',
      nav: {
        trades: 'Lệnh giao dịch',
        newTrade: 'Lệnh mới',
        importTrades: 'Nhập lệnh'
      }
    }
  },

  trade: {
    nav: {
      trades: 'Lệnh giao dịch',
      importTrades: 'Nhập lệnh'
    },

    range: {
      '1D': '1N',
      '7D': '7N',
      '30D': '30N'
    },

    dashboard: {
      title: 'Bảng điều khiển giao dịch',
      subtitle: 'Tổng quan hiệu suất',
      description:
        'Số liệu được tính từ danh sách lệnh hiện tại và lọc theo thời gian mở của từng lệnh.',
      cards: {
        totalTrades: 'Tổng số lệnh',
        openTrades: 'Lệnh đang mở',
        closedTrades: 'Lệnh đã đóng',
        mostTraded: 'Giao dịch nhiều nhất',
        estimatedPnl: 'Lãi/lỗ ước tính',
        pnlNote: 'Được tính từ {count} lệnh có đủ giá vào, giá ra và khối lượng.'
      },
      charts: {
        tradesOverTime: 'Lệnh theo thời gian',
        tradesOverTimeDescription: 'Thống kê số lệnh theo ngày (frontend).',
        symbolDistribution: 'Phân bố mã',
        symbolDistributionDescription: 'Những mã giao dịch nhiều nhất trong khoảng đã chọn.',
        sideDistribution: 'Phân bố chiều lệnh',
        sideDistributionDescription: 'Tỷ lệ mua và bán trong các lệnh đã lọc.',
        noSymbolData: 'Không có dữ liệu mã trong khoảng này.',
        noSideData: 'Không có dữ liệu chiều lệnh trong khoảng này.'
      }
    },

    list: {
      title: 'Danh sách lệnh',
      description: 'Định dạng dễ đọc trong khi vẫn giữ dữ liệu gốc từ API.',
      createTrade: 'Tạo lệnh',
      loading: 'Đang tải lệnh...',
      emptyTitle: 'Chưa có lệnh nào',
      emptyDescription: 'Tạo lệnh đầu tiên để bắt đầu xây dựng nhật ký.',
      deleteSubmitting: 'Đang xóa...',
      deleteConfirm: 'Xóa lệnh #{tradeNo} của {symbol}?',
      deleteError: 'Không thể xóa lệnh lúc này.',
      loadError: 'Không thể tải danh sách lệnh lúc này.',
      fields: {
        tradeNo: 'Số lệnh',
        symbol: 'Mã',
        sideStatus: 'Chiều / Trạng thái',
        entryQuantity: 'Giá vào / Khối lượng',
        openTime: 'Thời gian mở',
        riskLevels: 'Mức rủi ro',
        exit: 'Giá ra',
        lastUpdated: 'Cập nhật lần cuối',
        thesis: 'Luận điểm',
        note: 'Ghi chú',
        qty: 'KL',
        stillOpen: 'Vẫn đang mở / chưa đạt'
      },
      status: {
        open: 'Đang mở',
        closed: 'Đã đóng'
      },
      side: {
        buy: 'Mua',
        sell: 'Bán'
      }
    },

    form: {
      fields: {
        symbol: 'Mã',
        marketType: 'Loại thị trường',
        side: 'Chiều lệnh',
        openTime: 'Thời gian mở',
        entryPrice: 'Giá vào',
        stopLoss: 'Cắt lỗ',
        takeProfit: 'Chốt lời',
        quantity: 'Khối lượng',
        thesis: 'Luận điểm',
        note: 'Ghi chú'
      },
      placeholders: {
        thesis: 'Phá vỡ vùng kháng cự kèm xác nhận khối lượng',
        note: 'Đã điều chỉnh mức chốt lời sau khi động lượng được xác nhận'
      },
      marketType: {
        crypto: 'Tiền điện tử',
        forex: 'Ngoại hối',
        stock: 'Cổ phiếu',
        futures: 'Phái sinh'
      },
      side: {
        buy: 'Mua',
        sell: 'Bán'
      }
    },

    create: {
      title: 'Tạo lệnh',
      description:
        'Ghi lại một lệnh mới với các trường hiện tại. Dữ liệu được giữ dạng chuỗi để tương thích với API.',
      submit: 'Lưu lệnh',
      submitting: 'Đang lưu lệnh...',
      error: 'Không thể tạo lệnh lúc này.'
    },

    edit: {
      title: 'Sửa lệnh',
      description: 'Cập nhật thông tin giao dịch và gửi yêu cầu PATCH tới backend.',
      loading: 'Đang tải lệnh...',
      submit: 'Cập nhật lệnh',
      submitting: 'Đang cập nhật lệnh...',
      missingId: 'Thiếu trade id.',
      loadError: 'Không thể tải lệnh đã chọn.',
      error: 'Không thể cập nhật lệnh lúc này.'
    },

    import: {
      title: 'Nhập lệnh',
      description:
        'Tải lên file HTML MT5, xem trước dữ liệu đã phân tích, sau đó xác nhận nhập vào hệ thống.',
      sourceNote: 'Frontend chỉ gọi API preview/confirm, không tự parse file.',
      uploadLabel: 'File báo cáo HTML MT5',
      uploadHelp: 'Chọn file .html hoặc .htm xuất từ MT5.',
      selectedFile: 'File đã chọn',
      noFileSelected: 'Chưa chọn file.',
      preview: 'Xem trước',
      previewing: 'Đang xử lý...',
      confirm: 'Xác nhận nhập',
      confirming: 'Đang nhập...',
      reset: 'Xóa',
      previewRequired: 'Cần xem trước thành công trước khi xác nhận.',
      previewSuccess: 'Đã tải dữ liệu xem trước.',
      confirmSuccess: 'Nhập lệnh thành công.',
      errorsTitle: 'Lỗi',
      warningsTitle: 'Cảnh báo',
      requestError: 'Không thể xử lý yêu cầu lúc này.',

      metadata: {
        title: 'Thông tin xem trước',
        originalFilename: 'Tên file gốc',
        accountNo: 'Số tài khoản',
        accountName: 'Tên tài khoản',
        brokerName: 'Tên broker',
        brokerServer: 'Máy chủ broker',
        reportDate: 'Ngày báo cáo',
        totalRows: 'Tổng số dòng',
        parsedRows: 'Dòng đã phân tích',
        skippedRows: 'Dòng bị bỏ qua'
      },

      previewTable: {
        title: 'Dữ liệu xem trước',
        description: 'Các dòng này chưa được lưu vào hệ thống.',
        empty: 'Không có dữ liệu.',
        fields: {
          externalPositionId: 'Mã vị thế',
          externalOrderId: 'Mã lệnh',
          symbol: 'Mã',
          side: 'Chiều',
          quantity: 'Khối lượng',
          entryPrice: 'Giá vào',
          stopLoss: 'Cắt lỗ',
          takeProfit: 'Chốt lời',
          openTime: 'Thời gian mở',
          exitPrice: 'Giá ra',
          closeTime: 'Thời gian đóng',
          commission: 'Commission',
          swap: 'Swap',
          fee: 'Phí',
          profit: 'Lãi/lỗ',
          closeReason: 'Lý do đóng',
          rawComment: 'Ghi chú gốc'
        }
      },

      confirmSummary: {
        title: 'Tóm tắt nhập',
        importBatchId: 'Batch ID',
        totalRows: 'Tổng số dòng',
        importedRows: 'Đã nhập',
        skippedRows: 'Bỏ qua'
      },

      closeReason: {
        tp: 'Chốt lời',
        sl: 'Cắt lỗ',
        unknown: 'Không rõ'
      }
    }
  }
};