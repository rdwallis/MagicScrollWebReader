/* Readability. An Arc90 Lab Experiment. 
 * Website: http://lab.arc90.com/experiments/readability
 * Source:  http://code.google.com/p/arc90labs-readability
 *
 * Copyright (c) 2009 Arc90 Inc
 * Readability is licensed under the Apache License, Version 2.0.
 **/
var readability = {
	version: '0.5.1',
	iframeLoads: 0,
	frameHack: false,
	/**
	 * The frame hack is to workaround a firefox bug where if you
	 * pull content out of a frame and stick it into the parent element, the scrollbar won't appear.
	 * So we fake a scrollbar in the wrapping div.
	 **/
	bodyCache: null,
	/* Cache the body HTML in case we need to re-use it later */
	article: null,
	grandParent: false,

	/**
	 * All of the regular expressions in use within readability.
	 * Defined up here so we don't instantiate them repeatedly in loops.
	 **/
	regexps: {
		unlikelyCandidatesRe: /combx|comment|disqus|foot|menu|nav|rss|shoutbox|sidebar|sponsor|popup|signup|share|cCol/i,
		//header
		okMaybeItsACandidateRe: /and|article|body|column|main|content|news|mod/i,
		positiveRe: /aCol|article|body|content|entry|hentry|page|pagination|post|text|story/i,
		negativeRe: /block|combx|comment|contact|foot|footer|footnote|link|media|meta|promo|related|scroll|shoutbox|sponsor|tags|widget|bio|alert|addInfo|slideshow|share|nocontent/i,
		divToPElementsRe: /<(a|blockquote|dl|div|img|ol|p|pre|table|ul)/i,
		replaceBrsRe: /(<br[^>]*>[ \n\r\t]*){2,}/gi,
		replaceFontsRe: /<(\/?)font[^>]*>/gi,
		trimRe: /^\s+|\s+$/g,
		normalizeRe: /\s{2,}/g,
		killBreaksRe: /(<br\s*\/?>(\s|&nbsp;?)*){1,}/g,
		videoRe: /http:\/\/(www\.)?(youtube|vimeo)\.com/i,
		ignoreArticleTagRe: /http:\/\/(www\.)?(economist)\.com\/blogs/i

	},

	/**
	 * Runs readability.
	 *
	 * Workflow:
	 *  1. Prep the document by removing script tags, css, etc.
	 *  2. Build readability's DOM tree.
	 *  3. Grab the article content from the current dom tree.
	 *  4. Replace the current DOM tree with the new one.
	 *  5. Read peacefully.
	 *
	 * @return void
	 **/
	init: function(preserveUnlikelyCandidates) {
		if(typeof(window.stop) != "undefined") {
			window.stop();
		}
		preserveUnlikelyCandidates = (typeof preserveUnlikelyCandidates == 'undefined') ? false : preserveUnlikelyCandidates;

		if(document.body && !readability.bodyCache) readability.bodyCache = document.body.innerHTML;
		readability.prepDocument();
		ss_load.show();


		var articleTitle = readability.getArticleTitle();
		var articleContent = readability.grabArticle(preserveUnlikelyCandidates);

		/**
		 * If we attempted to strip unlikely candidates on the first run through, and we ended up with no content,
		 * that may mean we stripped out the actual content so we couldn't parse it. So re-run init while preserving
		 * unlikely candidates to have a better shot at getting our content out properly.
		 **/
		if(readability.getInnerText(articleContent, false) == "") {
			if(!preserveUnlikelyCandidates) {
				log("Discarding Unlikely Candidates", 2);
				document.body.innerHTML = readability.bodyCache;
				return readability.init(true);
			} else {
				readability.error = true;
				articleContent.innerHTML = "error";
			}
		} else {

			articleContent.insertBefore(articleTitle, articleContent.firstChild);
		}
		readability.article = articleContent.innerHTML;



	},


	/**
	 * Get the article title as an H1. Currently just uses document.title,
	 * we might want to be smarter in the future.
	 *
	 * @return void
	 **/
	getArticleTitle: function() {
		var articleTitle = document.createElement("H1");
		articleTitle.innerHTML = document.title;

		return articleTitle;
	},

	/**
	 * Prepare the HTML document for readability to scrape it.
	 * This includes things like stripping javascript, CSS, and handling terrible markup.
	 *
	 * @return void
	 **/
	prepDocument: function() {
		/**
		 * In some cases a body element can't be found (if the HTML is totally hosed for example)
		 * so we create a new body node and append it to the document.
		 */
		if(document.body === null) {
			body = document.createElement("body");
			try {
				document.body = body;
			} catch(e) {
				document.documentElement.appendChild(body);
			}
		}

		var frames = document.getElementsByTagName('frame');
		if(frames.length > 0) {
			var bestFrame = null;
			var bestFrameSize = 0;
			for(var frameIndex = 0; frameIndex < frames.length; frameIndex++) {
				var frameSize = frames[frameIndex].offsetWidth + frames[frameIndex].offsetHeight;
				var canAccessFrame = false;
				try {
					frames[frameIndex].contentWindow.document.body;
					canAccessFrame = true;
				} catch(e) {}

				if(canAccessFrame && frameSize > bestFrameSize) {
					bestFrame = frames[frameIndex];
					bestFrameSize = frameSize;
				}
			}

			if(bestFrame) {
				var newBody = document.createElement('body');
				newBody.innerHTML = bestFrame.contentWindow.document.body.innerHTML;
				newBody.style.overflow = 'scroll';
				document.body = newBody;

				var frameset = document.getElementsByTagName('frameset')[0];
				if(frameset) frameset.parentNode.removeChild(frameset);

				readability.frameHack = true;
			}
		}

		/* resize all images */

		var images = document.getElementsByTagName('img');
		for(i = images.length - 1; i >= 0; i--) {
			images[i].className = "ss_image";
		}


		/* remove all scripts that are not readability */
		var scripts = document.getElementsByTagName('script');
		for(i = scripts.length - 1; i >= 0; i--) {
			if(typeof(scripts[i].src) == "undefined" || scripts[i].src.indexOf('staticScroll') == -1) {
				scripts[i].parentNode.removeChild(scripts[i]);
			}
		}


		var asides = document.getElementsByTagName('aside');
		for(i = asides.length - 1; i >= 0; i--) {
			asides[i].parentNode.removeChild(asides[i]);
		}



		/* remove all stylesheets */
		for(var k = 0; k < document.styleSheets.length; k++) {
			if(document.styleSheets[k].href != null && document.styleSheets[k].href.lastIndexOf("staticscroll") == -1) {
				document.styleSheets[k].disabled = true;
			}
		}

		/* Remove all style tags in head (not doing this on IE) - TODO: Why not? */
		var styleTags = document.getElementsByTagName("style");
		for(var j = 0; j < styleTags.length; j++)
		if(navigator.appName != "Microsoft Internet Explorer") styleTags[j].textContent = "";

		var articles = document.getElementsByTagName("article");
		//var result = readability.regexps.articleTagRe.exec(document.body.innerHTML);
		//log("Result: " + result, -1);
		if((articles.length > 0) && (window.location.href.search(readability.regexps.ignoreArticleTagRe) == -1)) {
			var result = "";
			for (var i = 0; i < articles.length; i++) {
				log("Article " + i + ": \n" + articles[i].innerHTML, -1);
				if (result.length < articles[i].innerHTML.length) {
					result = articles[i].innerHTML;
				}
			} 
			document.body.innerHTML = result;
		} else {

			/* Turn all double br's into p's */
			/* Note, this is pretty costly as far as processing goes. Maybe optimize later. */
			document.body.innerHTML = document.body.innerHTML.replace(readability.regexps.replaceBrsRe, '</p><p>').replace(readability.regexps.replaceFontsRe, '<$1span>');
		}
		


	},

	/**
	 * Prepare the article node for display. Clean out any inline styles,
	 * iframes, forms, strip extraneous <p> tags, etc.
	 *
	 * @param Element
	 * @return void
	 **/
	prepArticle: function(articleContent) {
		readability.cleanStyles(articleContent);
		readability.killBreaks(articleContent);

		/* Clean out junk from the article content */
		readability.clean(articleContent, "form");
		readability.clean(articleContent, "object");
		readability.clean(articleContent, "h1");

		/**
		 * If there is only one h2, they are probably using it
		 * as a header and not a subheader, so remove it since we already have a header.
		 ***/
		if(articleContent.getElementsByTagName('h2').length == 1) readability.clean(articleContent, "h2");
		readability.clean(articleContent, "iframe");

		readability.cleanHeaders(articleContent);

		/* Do these last as the previous stuff may have removed junk that will affect these */
		readability.cleanConditionally(articleContent, "table");
		readability.cleanConditionally(articleContent, "ul");
		readability.cleanConditionally(articleContent, "div");

		/* Remove extra paragraphs */
		var articleParagraphs = articleContent.getElementsByTagName('p');
		for(i = articleParagraphs.length - 1; i >= 0; i--) {
			var imgCount = articleParagraphs[i].getElementsByTagName('img').length;
			var embedCount = articleParagraphs[i].getElementsByTagName('embed').length;
			var objectCount = articleParagraphs[i].getElementsByTagName('object').length;

			if(imgCount == 0 && embedCount == 0 && objectCount == 0 && readability.getInnerText(articleParagraphs[i], false) == '') {
				articleParagraphs[i].parentNode.removeChild(articleParagraphs[i]);
			}
		}

		try {
			articleContent.innerHTML = articleContent.innerHTML.replace(/<br[^>]*>\s*<p/gi, '<p');
		} catch(e) {
			log("Cleaning innerHTML of breaks failed. This is an IE strict-block-elements bug. Ignoring.", 1);
		}
	},

	/**
	 * Initialize a node with the readability object. Also checks the
	 * className/id for special names to add to its score.
	 *
	 * @param Element
	 * @return void
	 **/
	initializeNode: function(node) {
		node.readability = {
			"contentScore": 0
		};

		switch(node.tagName) {

		case 'NYT_TEXT':
			if(!node.parentNode.readability) {
				node.parentNode.readability = {
					"contentScore": 0
				};
			}
			node.parentNode.readability.contentScore += 405;


		case 'DIV':
			node.readability.contentScore += 5;
			break;
		case 'ARTICLE':
			node.readability.contentScore += 400;
			break;

		case 'PRE':
		case 'TD':
		case 'BLOCKQUOTE':
			node.readability.contentScore += 3;
			break;

		case 'ADDRESS':
		case 'OL':
		case 'UL':
		case 'DL':
		case 'DD':
		case 'DT':
		case 'LI':
		case 'FORM':
			node.readability.contentScore -= 3;
			break;

		case 'H1':
		case 'H2':
		case 'H3':
		case 'H4':
		case 'H5':
		case 'H6':
		case 'TH':
			node.readability.contentScore -= 5;
			break;
		}

		node.readability.contentScore += readability.getClassWeight(node);
	},


	/***
	 * grabArticle - Using a variety of metrics (content score, classname, element types), find the content that is
	 *               most likely to be the stuff a user wants to read. Then return it wrapped up in a div.
	 *
	 * @return Element
	 **/
	grabArticle: function(preserveUnlikelyCandidates) {
		/**
		 * First, node prepping. Trash nodes that look cruddy (like ones with the class name "comment", etc), and turn divs
		 * into P tags where they have been used inappropriately (as in, where they contain no other block level elements.)
		 *
		 * Note: Assignment from index for performance. See http://www.peachpit.com/articles/article.aspx?p=31567&seqNum=5
		 * TODO: Shouldn't this be a reverse traversal?
		 **/
		for(var nodeIndex = 0;
		(node = document.getElementsByTagName('*')[nodeIndex]); nodeIndex++) {

			/* Remove unlikely candidates */
			if(!preserveUnlikelyCandidates) {
				var unlikelyMatchString = node.className + node.id;
				if(unlikelyMatchString.search(readability.regexps.unlikelyCandidatesRe) !== -1 && unlikelyMatchString.search(readability.regexps.okMaybeItsACandidateRe) == -1 && node.tagName !== "BODY") {
					log("Removing unlikely candidate - " + unlikelyMatchString, 2);
					node.parentNode.removeChild(node);
					nodeIndex--;
					continue;
				}
			}

			/* Turn all divs that don't have children block level elements into p's */
			if(node.tagName === "DIV") {
				if(node.innerHTML.search(readability.regexps.divToPElementsRe) === -1) {
					log("Altering div to p", 2);
					var newNode = document.createElement('p');
					try {
						newNode.innerHTML = node.innerHTML;
						node.parentNode.replaceChild(newNode, node);
						nodeIndex--;
					} catch(e) {
						log("Could not alter div to p, probably an IE restriction, reverting back to div.", 1)
					}
				} else { /* EXPERIMENTAL */
					for(var i = 0, il = node.childNodes.length; i < il; i++) {
						var childNode = node.childNodes[i];
						if(childNode.nodeType == Node.TEXT_NODE) {
							log("replacing text node with a p tag with the same content.", 2);
							var p = document.createElement('p');
							p.innerHTML = childNode.nodeValue;
							p.style.display = 'inline';
							p.className = 'readability-styled';
							childNode.parentNode.replaceChild(p, childNode);
						}

					}
				}
			}
		}
		/**
		 * Loop through all paragraphs, and assign a score to them based on how content-y they look.
		 * Then add their score to their parent node.
		 *
		 * A score is determined by things like number of commas, class names, etc. Maybe eventually link density.
		 **/
		var allParagraphs = document.getElementsByTagName("p");
		var candidates = [];

		for(var j = 0; j < allParagraphs.length; j++) {

			var parentNode = allParagraphs[j].parentNode;
			var grandParentNode = parentNode.parentNode;
			var innerText = readability.getInnerText(allParagraphs[j]);

			/* If this paragraph is less than 25 characters, don't even count it. */
			if(innerText.length < 25) continue;

			log("Considering paragraph " + j + ": " + innerText.substring(0, 20), 3); /* Initialize readability data for the parent. */
			if(typeof parentNode.readability == 'undefined') {
				readability.initializeNode(parentNode);
				candidates.push(parentNode);
			}

			/* Initialize readability data for the grandparent. */
			if(typeof grandParentNode.readability == 'undefined') {
				readability.initializeNode(grandParentNode);
				candidates.push(grandParentNode);
			}

			var contentScore = 0;

			/* Add a point for the paragraph itself as a base. */
			contentScore++;

			/* Add points for any commas within this paragraph */
			contentScore += innerText.split(',').length;

			/* For every 100 characters in this paragraph, add another point. Up to 3 points. */
			contentScore += Math.min(Math.floor(innerText.length / 100), 3);

			/* Add the score to the parent. The grandparent gets half. */
			parentNode.readability.contentScore += contentScore;
			grandParentNode.readability.contentScore += contentScore / 2;
			log("contentScore=" + contentScore, 2);
		}

		/**
		 * After we've calculated scores, loop through all of the possible candidate nodes we found
		 * and find the one with the highest score.
		 **/
		var topCandidates = [];
		var topCandidate = null;
		for(var i = 0, il = candidates.length; i < il; i++) {
			/**
			 * Scale the final candidates score based on link density. Good content should have a
			 * relatively small link density (5% or less) and be mostly unaffected by this operation.
			 **/
			candidates[i].readability.contentScore = candidates[i].readability.contentScore * (1 - readability.getLinkDensity(candidates[i]));

			log('Candidate: ' + candidates[i] + " (" + candidates[i].className + ":" + candidates[i].id + ") with score " + candidates[i].readability.contentScore, 2);



			if(!topCandidate || candidates[i].readability.contentScore > topCandidate.readability.contentScore) {
				topCandidate = candidates[i];
			}
			if((readability.grandParent) && (candidates[i].readability.contentScore > 50)) {
				topCandidates.push(candidates[i]);
			}
		}

		/**
		 * If we still have no top candidate, just use the body as a last resort.
		 * We also have to copy the body node so it is something we can modify.
		 **/
		if(topCandidate == null || topCandidate.tagName == "BODY") {
			topCandidate = document.createElement("DIV");
			topCandidate.innerHTML = document.body.innerHTML;
			document.body.innerHTML = "";
			document.body.appendChild(topCandidate);
			readability.initializeNode(topCandidate);
		}
		//topCandidates = [];
		if(topCandidates.length === 0) {
			topCandidates.push(topCandidate);
		}


		/**
		 * Now that we have the top candidate, look through its siblings for content that might also be related.
		 * Things like preambles, content split by ads that we removed, etc.
		 **/
		var articleContent = document.createElement("DIV");
		articleContent.id = "readability-content";
		var siblingScoreThreshold = Math.max(10, topCandidate.readability.contentScore * 0.2);
		log("Top Candidates: " + topCandidates.length, 2);
		for(var k = 0; k < topCandidates.length; k++) {
			var siblingNodes = topCandidates[k].parentNode.childNodes;
			for(var i = 0, il = siblingNodes.length; i < il; i++) {
				var siblingNode = siblingNodes[i];
				var append = false;

				log("Looking at sibling node: " + siblingNode + " (" + siblingNode.className + ":" + siblingNode.id + ")" + ((typeof siblingNode.readability != 'undefined') ? (" with score " + siblingNode.readability.contentScore) : ''), 2);
				log("Sibling has score " + (siblingNode.readability ? siblingNode.readability.contentScore : 'Unknown'), 2);

				if(siblingNode === topCandidates[k]) {
					append = true;
				}

				if(typeof siblingNode.readability != 'undefined' && siblingNode.readability.contentScore >= siblingScoreThreshold) {
					append = true;
				}

				if(siblingNode.nodeName == "P") {
					var linkDensity = readability.getLinkDensity(siblingNode);
					var nodeContent = readability.getInnerText(siblingNode);
					var nodeLength = nodeContent.length;

					if(nodeLength > 80 && linkDensity < 0.25) {
						append = true;
					} else if(nodeLength < 80 && linkDensity == 0 && nodeContent.search(/\.( |$)/) !== -1) {
						append = true;
					}
				}

				if(append) {
					log("Appending node: " + siblingNode, 2);

					/* Append sibling and subtract from our list because it removes the node when you append to another node */
					articleContent.appendChild(siblingNode);
					i--;
					il--;
				}

			}

		}

		/**
		 * So we have all of the content that we need. Now we clean it up for presentation.
		 **/
		readability.prepArticle(articleContent);

		return articleContent;
	},

	/**
	 * Get the inner text of a node - cross browser compatibly.
	 * This also strips out any excess whitespace to be found.
	 *
	 * @param Element
	 * @return string
	 **/
	getInnerText: function(e, normalizeSpaces) {
		var textContent = "";

		normalizeSpaces = (typeof normalizeSpaces == 'undefined') ? true : normalizeSpaces;

		if(navigator.appName == "Microsoft Internet Explorer") textContent = e.innerText.replace(readability.regexps.trimRe, "");
		else textContent = e.textContent.replace(readability.regexps.trimRe, "");

		if(normalizeSpaces) return textContent.replace(readability.regexps.normalizeRe, " ");
		else return textContent;
	},

	/**
	 * Get the number of times a string s appears in the node e.
	 *
	 * @param Element
	 * @param string - what to split on. Default is ","
	 * @return number (integer)
	 **/
	getCharCount: function(e, s) {
		s = s || ",";
		return readability.getInnerText(e).split(s).length;
	},

	/**
	 * Remove the style attribute on every e and under.
	 * TODO: Test if getElementsByTagName(*) is faster.
	 *
	 * @param Element
	 * @return void
	 **/
	cleanStyles: function(e) {
		e = e || document;
		var cur = e.firstChild;

		if(!e) return;

		// Remove any root styles, if we're able.
		if(typeof e.removeAttribute == 'function' && e.className != 'readability-styled') e.removeAttribute('style');

		// Go until there are no more child nodes
		while(cur != null) {
			if(cur.nodeType == 1) {
				// Remove style attribute(s) :
				if(cur.className != "readability-styled") {
					cur.removeAttribute("style");
				}
				readability.cleanStyles(cur);
			}
			cur = cur.nextSibling;
		}
	},

	/**
	 * Get the density of links as a percentage of the content
	 * This is the amount of text that is inside a link divided by the total text in the node.
	 *
	 * @param Element
	 * @return number (float)
	 **/
	getLinkDensity: function(e) {
		var links = e.getElementsByTagName("a");
		var textLength = readability.getInnerText(e).length;
		var linkLength = 0;
		for(var i = 0, il = links.length; i < il; i++) {
			linkLength += readability.getInnerText(links[i]).length;
		}

		return linkLength / textLength;
	},

	/**
	 * Get an elements class/id weight. Uses regular expressions to tell if this
	 * element looks good or bad.
	 *
	 * @param Element
	 * @return number (Integer)
	 **/
	getClassWeight: function(e) {
		var weight = 0;
		if(e.className == "") {
			var prop = e.getAttribute('itemprop');
			if(prop) {
				e.className = prop;
			} else {
				var ident = e.getAttribute('id');
				if(ident) {
					e.className = ident;
				}
			}

		}

		/* Look for a special classname */
		if(e.className != "") {
			if(e.className.search(readability.regexps.negativeRe) !== -1) weight -= 25;

			if(e.className.search(readability.regexps.positiveRe) !== -1) weight += 25;
		}


		/* Look for a special ID */
		if(typeof(e.id) == 'string' && e.id != "") {
			if(e.id.search(readability.regexps.negativeRe) !== -1) weight -= 25;

			if(e.id.search(readability.regexps.positiveRe) !== -1) weight += 25;
		}

		return weight;
	},

	/**
	 * Remove extraneous break tags from a node.
	 *
	 * @param Element
	 * @return void
	 **/
	killBreaks: function(e) {
		try {
			e.innerHTML = e.innerHTML.replace(readability.regexps.killBreaksRe, '<br />');
		} catch(e) {
			log("KillBreaks failed - this is an IE bug. Ignoring.", 1);
		}
	},

	/**
	 * Clean a node of all elements of type "tag".
	 * (Unless it's a youtube/vimeo video. People love movies.)
	 *
	 * @param Element
	 * @param string tag to clean
	 * @return void
	 **/
	clean: function(e, tag) {
		var targetList = e.getElementsByTagName(tag);
		var isEmbed = (tag == 'object' || tag == 'embed');

		for(var y = targetList.length - 1; y >= 0; y--) { /* Allow youtube and vimeo videos through as people usually want to see those. */
			if(isEmbed && targetList[y].innerHTML.search(readability.regexps.videoRe) !== -1) {
				continue;
			}

			targetList[y].parentNode.removeChild(targetList[y]);
		}
	},

	/**
	 * Clean an element of all tags of type "tag" if they look fishy.
	 * "Fishy" is an algorithm based on content length, classnames, link density, number of images & embeds, etc.
	 *
	 * @return void
	 **/
	cleanConditionally: function(e, tag) {
		var tagsList = e.getElementsByTagName(tag);
		var curTagsLength = tagsList.length;

		/**
		 * Gather counts for other typical elements embedded within.
		 * Traverse backwards so we can remove nodes at the same time without effecting the traversal.
		 *
		 * TODO: Consider taking into account original contentScore here.
		 **/
		for(var i = curTagsLength - 1; i >= 0; i--) {
			var weight = readability.getClassWeight(tagsList[i]);

			log("Cleaning Conditionally " + tagsList[i] + " (" + tagsList[i].className + ":" + tagsList[i].id + ")" + ((typeof tagsList[i].readability != 'undefined') ? (" with score " + tagsList[i].readability.contentScore) : ''), 2);

			if(weight < 0) {
				tagsList[i].parentNode.removeChild(tagsList[i]);
			} else if(readability.getCharCount(tagsList[i], ',') < 10) {
				/**
				 * If there are not very many commas, and the number of
				 * non-paragraph elements is more than paragraphs or other ominous signs, remove the element.
				 **/

				var p = tagsList[i].getElementsByTagName("p").length;
				var img = tagsList[i].getElementsByTagName("img").length;
				var li = tagsList[i].getElementsByTagName("li").length - 100;
				var input = tagsList[i].getElementsByTagName("input").length;

				var embedCount = 0;
				var embeds = tagsList[i].getElementsByTagName("embed");
				for(var ei = 0, il = embeds.length; ei < il; ei++) {
					if(embeds[ei].src.search(readability.regexps.videoRe) == -1) {
						embedCount++;
					}
				}

				var linkDensity = readability.getLinkDensity(tagsList[i]);
				var contentLength = readability.getInnerText(tagsList[i]).length;
				var toRemove = false;

				if(img > p) {
					toRemove = true;
				} else if(li > p && tag != "ul" && tag != "ol") {
					toRemove = true;
				} else if(input > Math.floor(p / 3)) {
					toRemove = true;
				} else if(contentLength < 25 && (img == 0 || img > 2)) {
					toRemove = true;
				} else if(weight < 25 && linkDensity > .2) {
					toRemove = true;
				} else if(weight >= 25 && linkDensity > .5) {
					toRemove = true;
				} else if((embedCount == 1 && contentLength < 75) || embedCount > 1) {
					toRemove = true;
				}

				if(toRemove) {
					tagsList[i].parentNode.removeChild(tagsList[i]);
				}
			}
		}
	},

	/**
	 * Clean out spurious headers from an Element. Checks things like classnames and link density.
	 *
	 * @param Element
	 * @return void
	 **/
	cleanHeaders: function(e) {
		for(var headerIndex = 1; headerIndex < 7; headerIndex++) {
			var headers = e.getElementsByTagName('h' + headerIndex);
			for(var i = headers.length - 1; i >= 0; i--) {
				if(readability.getClassWeight(headers[i]) < 0 || readability.getLinkDensity(headers[i]) > 0.33) {
					headers[i].parentNode.removeChild(headers[i]);
				}
			}
		}
	},


	/**
	 * Close the email popup. This is a hacktackular way to check if we're in a "close loop".
	 * Since we don't have crossdomain access to the frame, we can only know when it has
	 * loaded again. If it's loaded over 3 times, we know to close the frame.
	 *
	 * @return void
	 **/
	removeFrame: function() {
		readability.iframeLoads++;
		if(readability.iframeLoads > 3) {
			var emailContainer = document.getElementById('email-container');
			if(null !== emailContainer) {
				emailContainer.parentNode.removeChild(emailContainer);
			}

			var kindleContainer = document.getElementById('kindle-container');
			if(null !== kindleContainer) {
				kindleContainer.parentNode.removeChild(kindleContainer);
			}

			readability.iframeLoads = 0;
		}
	},

	htmlspecialchars: function(s) {
		if(typeof(s) == "string") {
			s = s.replace(/&/g, "&amp;");
			s = s.replace(/"/g, "&quot;");
			s = s.replace(/'/g, "&#039;");
			s = s.replace(/</g, "&lt;");
			s = s.replace(/>/g, "&gt;");
		}

		return s;
	}

};
log("Starting Readability", 2);
readability.init();