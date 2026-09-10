// Local ReportHandler type - avoid depending on external typings for this helper
type ReportHandler = (metric: any) => void;

const reportWebVitals = (onPerfEntry?: ReportHandler) => {
  if (onPerfEntry && onPerfEntry instanceof Function) {
    import('web-vitals').then((wv: any) => {
      const { getCLS, getFID, getFCP, getLCP, getTTFB } = wv;
      getCLS(onPerfEntry);
      getFID(onPerfEntry);
      getFCP(onPerfEntry);
      getLCP(onPerfEntry);
      getTTFB(onPerfEntry);
    }).catch(() => { /* ignore in non-browser environments */ });
  }
};

export default reportWebVitals;
