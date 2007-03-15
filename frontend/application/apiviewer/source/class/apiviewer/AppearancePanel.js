qx.Class.define("apiviewer.AppearancePanel", {
  
  extend: apiviewer.InfoPanel,
  
  members : {

    __getAllAppearanceStates: function(apperanceNode)
    {
      var TreeUtil = apiviewer.TreeUtil;
      var states = TreeUtil.getChild(apperanceNode, "states");
      if (states) {
        states = qx.lang.Array.copy(states.children);
      } else {
        states = [];
      }

      var type = apperanceNode.attributes.type;
      var classNode = apperanceNode.parent.parent;
      var startIndex = 1;
      if (type != classNode.attributes.fullName) {
        classNode = apiviewer.ClassViewer.getClassDocNode(type);
        startIndex = 0;
      }

      var docTree = apiviewer.Viewer.instance.getDocTree();
      var classNodes = apiviewer.TreeUtil.getInheritanceChain(docTree, classNode);

      for (var i=startIndex; i<classNodes.length; i++)
      {
        classNode = classNodes[i];
        var appear = TreeUtil.getChild(classNode, "appearances");
        if (appear)
        {
          var classAppearance = TreeUtil.getChildByAttribute(appear, "type", classNode.attributes.fullName);
          if (classAppearance) {
            var classStates = TreeUtil.getChild(classAppearance, "states");
            if (classStates) {
              qx.lang.Array.append(states, classStates.children);  
            }
          }
        }
      }
      return states;
      
      
      qx.dev.Pollution.getInfo();
         
    },

    
    /**
     * Retuns a list of all items to display in the panel
     */
    _getPanelItems : function(showInherited, currentClassDocNode)
    {
      var TreeUtil = apiviewer.TreeUtil;
      var appearances = this.base(arguments, showInherited, currentClassDocNode);
      if (!showInherited) {
        return appearances;
      }

      var docTree = apiviewer.Viewer.instance.getDocTree();
      var classNodes = TreeUtil.getInheritanceChain(docTree, currentClassDocNode);
      for (var i=0; i<classNodes.length; i++)
      {
        classNode = classNodes[i];
        var appear = TreeUtil.getChild(classNode, "appearances");
        if (appear)
        {
          var classAppearance = TreeUtil.getChildByAttribute(appear, "type", classNode.attributes.fullName);
          if (classAppearance) {
            if (classAppearance.attributes.type != currentClassDocNode.attributes.fullName) {
              appearances.push(classAppearance)
            }
            return appearances;
          }
        }        
      }
    },

        
    /**
     * Creates the HTML showing the information about an appearance.
     *
     * @type member
     * @param node {Map} the doc node of the property.
     * @param fromClassNode {Map} the doc node of the class the property was defined.
     * @param currentClassDocNode {Map} the doc node of the currently displayed class
     * @param showDetails {Boolean} whether to show the details.
     * @return {String} the HTML showing the information about the property.
     */
    getItemHtml : function(node, fromClassNode, currentClassDocNode, showDetails)
    {
      var ClassViewer = apiviewer.ClassViewer;
      var TreeUtil = apiviewer.TreeUtil;

      var nodeName = node.attributes.name;
      var nodeType = node.attributes.type;
      var className = currentClassDocNode.attributes.fullName;
      if (nodeType == className) {
        var titleHtml = nodeName + " (default appearance of the class)";
      } else {
        var titleHtml = nodeName;
      }
      var typeHtml = apiviewer.InfoPanel.createTypeHtml(node, fromClassNode, "var");
      
      var textHtml = new qx.util.StringBuilder();
      textHtml.add(apiviewer.InfoPanel.createDescriptionHtml(node, fromClassNode, true));
      
      if (showDetails)
      {
        var states = this.__getAllAppearanceStates(node);
        
        if (states)
        {
          textHtml.add(ClassViewer.DIV_START_DETAIL_HEADLINE, "States:", ClassViewer.DIV_END);
          textHtml.add("<table>");
          
          for (var i=0; i<states.length; i++) 
          {
            var state = states[i];  
             
            textHtml.add("<tr>");
            textHtml.add(
              "<td class='state-name'>",
              ClassViewer.SPAN_START_PARAM_NAME,
              state.attributes.name,
              ClassViewer.SPAN_END,
              "</td>"
            );
            textHtml.add(
              "<td class='state-text'>",
              apiviewer.InfoPanel.createDescriptionHtml(state, fromClassNode, true),
              "</td>"
            );
            if (state.parent.parent.attributes.type != className) {
              textHtml.add(
                "<td class='state-from-class'>",
                "(defined at ", apiviewer.InfoPanel.createItemLinkHtml(state.parent.parent.attributes.type), ")",
                "</td>"
              );
            }
            
            textHtml.add("</tr>");
          }
          
          textHtml.add("</table>");
          textHtml.add(ClassViewer.DIV_END);
        }
      }
      
      var info = {};
      info.textHtml = textHtml.get();
      info.typeHtml = typeHtml;
      info.titleHtml = titleHtml;     
      
      return info;      
    },
    
    
    /**
     * Checks whether an appearance has details.
     *
     * @type member
     * @param node {Map} the doc node of the method.
     * @param fromClassNode {Map} the doc node of the class the method was defined.
     * @param currentClassDocNode {Map} the doc node of the currently displayed class
     * @return {Boolean} whether the method has details.
     */
    itemHasDetails : function(node, fromClassNode, currentClassDocNode)
    {    
      return true; //apiviewer.TreeUtil.getChild(node, "states") != null
    }
    
  }
});