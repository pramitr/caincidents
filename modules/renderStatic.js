let renderStatic = (req, res, pageName, title, pageId) => {
	res.render('pages/'+pageName, {
        pageLabel: title,
        pageTitle: title,
        pageId: pageId
    });
}

module.exports = renderStatic;