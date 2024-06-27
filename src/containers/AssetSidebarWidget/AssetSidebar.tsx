import "./styles.scss";
import { useEffect, useState } from "react";
import ContentstackAppSDK from "@contentstack/app-sdk";
import { Button, TextInput } from "@contentstack/venus-components";
const AssetSidebarExtension = () => {
  const [state, setState] = useState<any>({
    config: {},
    location: {},
    appSdkInitialized: false,
  });
  const [assetData, setAssetData] = useState<any>({});
  const [captions, setCaptions] = useState<any>([]);
  useEffect(() => {
    ContentstackAppSDK.init().then(async (appSdk: any) => {
      const config = await appSdk?.getConfig();
      setState({
        config,
        location: appSdk?.location,
        appSdkInitialized: true,
        appSdk: appSdk,
      });
      console.log(appSdk);
      const assetDataFromLocation = await appSdk?.location?.AssetSidebarWidget?.getData();
      const { locales } = await appSdk?.stack?.getLocales();
      console.log(locales);
      console.log(assetDataFromLocation);
      let metaUID = appSdk.location.AssetSidebarWidget?.currentAsset?._metadata?.extensions[appSdk.locationUID][0].uid;
      // if (metaUID) {
      //   const response = await appSdk.metadata.retrieveMetaData({
      //     uid: metaUID,
      //   });
      //   const captions =  response.data?.metadata.captions;
      //   console.log(captions);
      //   console.log(
      //     appSdk.metadata.retrieveMetaData({
      //       uid: metaUID,
      //     })
      //   );
      // }
      if (metaUID) {
        const response = await appSdk.metadata.retrieveMetaData({
          uid: metaUID,
        });

        // Check get value of caption from locales that are currently in the stack.
        const captionFromLocation = response.data?.metadata.captions;
        console.log(captionFromLocation);
        // Filter captionFromLocation based on names in locales
        const filteredCaptions = captionFromLocation.filter((caption: any) =>
          locales.some((locale: any) => locale.name === caption.name)
        );
        console.log(filteredCaptions);
        // Combine locales with data from filteredCaptions
        const combinedArray = locales.map((locale: any) => {
          const match = filteredCaptions.find((caption: any) => caption.name === locale.name);
          return {
            code: locale.code,
            name: locale.name,
            text: match ? match.text : null, // or any other specific format
          };
        });
        console.log(combinedArray);
        setCaptions(combinedArray);
      } else {
        const captions = locales.map((locale: any) => ({
          name: locale.name,
          text: "",
          code: locale.code,
        }));
        setCaptions(captions);
        console.log(captions);
      }

      setAssetData(assetDataFromLocation);
      appSdk.location.AssetSidebarWidget?.onSave(() => handleSaveMetaData(appSdk));
    });
  }, []);

  
  const handleCaptionBlur = (index: number, event: React.FocusEvent<HTMLInputElement>) => {
    const newCaptions = [...captions];
    newCaptions[index].text = event.target.value;
    setCaptions(newCaptions);
  };
  const handleSaveMetaData = async (appSdk: any) => {
    let metaUID = appSdk.location?.AssetSidebarWidget?.currentAsset?._metadata?.extensions[appSdk.locationUID][0].uid;
    console.log(metaUID);
    if (metaUID) {
      const res = await appSdk.metadata.updateMetaData({
        uid: metaUID,
        entity_uid: assetData.uid,
        type: "asset",
        extension_uid: appSdk.locationUID,
        captions: captions,
      });
    } else {
      const res = await appSdk.metadata.createMetaData({
        entity_uid: assetData.uid,
        type: "asset",
        extension_uid: appSdk.locationUID,
        captions: captions,
      });
      console.log(res);
    }
  };
  return (
    <div className="side-bar">
      <div className="side-bar-header">Captions for different locales</div>
      <div className="side-bar-container">
        {captions.map((caption: any, index: number) => {
          //console.log(caption.locale);
          return (
            <div className="locale-field">
              {caption.name}
              <TextInput
                value={caption.text}
                onBlur={(e: any) => handleCaptionBlur(index, e)}
                placeholder="Type Something..."
                type="text"
              />
            </div>
          );
        })}
        <Button buttonType="tertiary" hover onClick={() => handleSaveMetaData(state.appSdk)}>
          Save Metadata
        </Button>
      </div>
      {/* {
        locales && locales.map()
      } */}
    </div>
  );
};

export default AssetSidebarExtension;
