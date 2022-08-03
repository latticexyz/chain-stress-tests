import { Report, Prefabs } from "@latticexyz/stressoor";

const {
  ReportTime,
  ReportTimeTemplatedString,
  ReportMaxMinMean,
  ReportStats,
  ReportDataArray,
} = Prefabs.Report;

export const reports: Report[] = [
  new ReportTime(),
  // new ReportDataArray("tx"),
  new ReportStats("txLatency", "milliseconds"),
  new ReportStats("txBlockNumberDelta", "blockNumberDelta"),
  // new ReportMaxMinMean("txLatency", "milliseconds"),
  // new ReportMaxMinMean("txBlockNumberDelta", "blockNumberDelta"),
  new ReportMaxMinMean("txReceiptBlockNumber", "receiptBlockNumber"),
  new ReportMaxMinMean("txStatus", "status"),
  new ReportTimeTemplatedString(
    "txPoolGrafanaUrl",
    "<grafanaUrl>&from=$startTime&to=$endTime"
  ),
];
