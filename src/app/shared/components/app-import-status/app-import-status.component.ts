import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { I18nService } from '../../../core/services/i18n.service';
import { TradeImportTaskService } from '../../../features/trade/data-access/trade-import-task.service';

@Component({
  selector: 'app-import-status',
  imports: [RouterLink],
  templateUrl: './app-import-status.component.html',
  styleUrl: './app-import-status.component.css',
})
export class AppImportStatusComponent {
  protected readonly task = inject(TradeImportTaskService);
  protected readonly i18n = inject(I18nService);
}
