import { GoogleAnalytics } from "@next/third-parties/google";
import { useReportWebVitals } from 'next/web-vitals'

function MyApp({ Component, pageProps }) {
  useReportWebVitals(metric => {
    // This function is called once for each web vital metric
    const { id, name, label, value } = metric
    // Use `window.gtag` if you initialized Google Analytics as this example:
    // https://github.com/vercel/next.js/blob/canary/examples/with-google-analytics/pages/_app.js
    window.gtag('event', name, {
      event_category: label === 'web-vital' ? 'Web Vitals' : 'Next.js custom metric',
      value: Math.round(name === 'CLS' ? value * 1000 : value), // values must be integers
      event_label: id, // id unique to current page load
      non_interaction: true, // avoids affecting bounce rate
    })

    return (
        <>
          <Component {...pageProps} />
          <GoogleAnalytics
            gaId="G-Q9HHTPT7YE, GT-MR5FQ68L"
          />
        </>
      );
  })

  return <Component {...pageProps} />
}
export default MyApp