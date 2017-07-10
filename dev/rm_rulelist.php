<?php require_once 'appphp/sqldb.php';?>
<?php include_once 'header.php';?>
<?php include_once 'appphp/rule_list_array.php';?>
<?php $page = 'rm_rulelist.php' ?>
<?php $defaultRuleSetID = 1 ?>
<?php $current_ruleset_id = (isset($_GET['rulesetid'])) ? $_GET['rulesetid'] : $defaultRuleSetID ?>

<!-- Custom CSS -->
<link href="css/sb-admin.css" rel="stylesheet">
<!-- Custom JS -->
<script src="js/rm_rulelist.js"></script>

<div id="wrapper">

    <?php include_once 'rm_sidebar.php';?>

    <div id="page-wrapper" style="position:absolute;width:100%;height:100%;">

      <div style="margin-top:10px;">
        <ol class="breadcrumb" style="margin-bottom:10px;">
          <li><a href="index.php">Home</a></li>
          <li>Rule Manager</li>
          <li id="rule-title-li">Rule List - <?php echo $rule_list[$current_ruleset_id]['RuleName'];?></li>
        </ol>
      </div>

      <span>Select Transcode Rule</span><br>
      <div id="rule-list-div" style="display:inline-block;height:50%;width:25%;padding:10px;overflow:auto;">
        <table id="rule-list-table" class="table table-hover">
          <tbody>
            <?php
              foreach ($rule_list as $rule_set_id => $rule) {
                  $class = ($rule_set_id === (integer) $current_ruleset_id) ? 'info' : '';
                  echo '<tr style="cursor:pointer;" class="'.$class.'" data-rulesetid="'.$rule_set_id.'" data-rulevar="'.$rule['RuleVar'].'">
                  <td>'.$rule['RuleName'].'
                  <span style="display:inline-block;margin-right:0px;font-size:14px;"><i class="fa fa-clone" aria-hidden="true"></i></spn>
                  <span style="display:inline-block;margin-right:0px;font-size:14px;"><i class="fa fa-minus-square-o" aria-hidden="true"></i></span>
                  </td></tr>';
              }
            ?>
          </tbody>
        </table>
      </div>
      <div id="rule-info" style="display:inline-block;height:35%;width:40%;vertical-align:top;background-color:#f5f5f5;border-radius:5px;margin-left:10px;padding:10px;">
        <?php
        echo '<span style="font-size:18px">RuleSetID : '.$defaultRuleSetID.'</span><br>';
        foreach ($rule_list[$defaultRuleSetID] as $key => $value):
            echo '<span style="font-size:18px">'.$key.' : '.$value.'</span><br>';
        endforeach; ?>
      </div>

    </div>

</div>

<?php include_once 'footer.php';?>
