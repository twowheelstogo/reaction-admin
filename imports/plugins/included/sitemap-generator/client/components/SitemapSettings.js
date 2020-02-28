import React from "react";
import { makeStyles } from "@material-ui/styles";
import { Components } from "@reactioncommerce/reaction-components";
import Select from "@reactioncommerce/components/Select/v1";
import { useMutation, useLazyQuery } from "@apollo/react-hooks";
import Button from "@reactioncommerce/catalyst/Button";
import Card from "@material-ui/core/Card";
import CardActions from "@material-ui/core/CardActions";
import CardContent from "@material-ui/core/CardContent";
import CardHeader from "@material-ui/core/CardHeader";
import FormLabel from "@material-ui/core/FormLabel";
import Grid from "@material-ui/core/Grid";
import { i18next } from "/client/api";
import Logger from "/client/modules/logger";
import generateSitemapsMutation from "../mutations/generateSitemaps";
import updateShopSettingsMutation from "../mutations/updateShopSettings";
import shopSettingsQuery from "../queries/shopSettings";
import useCurrentShopId from "/imports/client/ui/hooks/useCurrentShopId";

const useStyles = makeStyles((theme) => ({
  card: {
    // Without this, the Select dropdown menu gets cut off at the bottom of the card
    overflow: "visible",
    marginTop: theme.spacing(3),
    marginBottom: theme.spacing(3)
  }
}));

const refreshOptions = [
  {
    label: "Every 24 hours",
    value: "every 24 hours"
  },
  {
    label: "Every 12 hours",
    value: "every 12 hours"
  },
  {
    label: "Every hour",
    value: "every 1 hour"
  }
];

/**
 * Sitemap settings form block component
 * @returns {Node} React node
 */
export default function SitemapSettings() {
  const [shopId] = useCurrentShopId();
  const classes = useStyles();
  const [getShopSettings, { loading: loadingSettings, data, error, called }] = useLazyQuery(shopSettingsQuery);

  if (error) {
    Logger.error(error);
  }

  if (shopId && !called) {
    getShopSettings({
      variables: {
        shopId
      }
    });
  }

  const [generateSitemaps] = useMutation(generateSitemapsMutation);
  const [updateShopSettings, { loading: isUpdatingShopSettings }] = useMutation(updateShopSettingsMutation);

  if (!called || loadingSettings) return <Components.Loading />;
  if (error) {
    return (
      <Card>
        <CardHeader title={i18next.t("SitemapSettings.cardTitle")} />
        <CardContent>
          <p>{i18next.t("SitemapSettings.cardErrorContent")}</p>
        </CardContent>
      </Card>
    );
  }

  const { sitemapRefreshPeriod } = data && data.shopSettings;

  const onGenerateClick = () => {
    generateSitemaps();
    Alerts.toast(i18next.t("shopSettings.sitemapRefreshInitiated"), "success");
  };

  const onRefreshPeriodChange = (value) => {
    if (!value) return;

    updateShopSettings({
      variables: {
        input: {
          settingsUpdates: {
            sitemapRefreshPeriod: value
          },
          shopId
        }
      }
    });
  };

  return (
    <Card className={classes.card}>
      <CardHeader title={i18next.t("SitemapSettings.cardTitle")} />
      <CardContent>
        <FormLabel>{i18next.t("SitemapSettings.refreshPeriodFieldLabel")}</FormLabel>
        <Select
          isReadOnly={isUpdatingShopSettings}
          onChange={onRefreshPeriodChange}
          options={refreshOptions}
          placeholder={i18next.t("SitemapSettings.refreshPeriodFieldPlaceholder")}
          value={sitemapRefreshPeriod}
        />
      </CardContent>
      <CardActions>
        <Grid container alignItems="center" justify="flex-end">
          <a style={{ marginRight: 20 }} href="/sitemap.xml" target="_blank">{i18next.t("SitemapSettings.viewSitemapButtonText")}</a>
          <Button color="primary" variant="outlined" onClick={onGenerateClick}>
            {i18next.t("shopSettings.refreshSitemapsNow")}
          </Button>
        </Grid>
      </CardActions>
    </Card>
  );
}
