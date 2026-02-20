function extractPublicId(cloudinaryUrl) {
    const urlParts = cloudinaryUrl.split('/');
    const versionIndex = urlParts.findIndex((part) => part.startsWith('v'));
  
    if (versionIndex !== -1) {
      
      let publicIdWithExt = urlParts.slice(versionIndex + 1).join('/');
  

      return publicIdWithExt.replace(/\.[^/.]+$/, "");
    }
  
    return null; 
  }

  export default extractPublicId;