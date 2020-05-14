export const appContainerId = 'root'

export const getAppContainer = () => {
  const container = document.getElementById(appContainerId)
  if (!container) {
    throw new Error('💣 This is embarrassing, the App couldnt find a container to fit it')
  }
  return container
}

export const withAppContainerTags = (ssr: string) => `<div id="${appContainerId}">${ssr}</div>`
